import { logger } from './logger';

// Redis is optional — when not available, all cache operations are no-ops.
// This prevents ioredis from spamming connection errors when Redis isn't running.

let redisAvailable = false;
let redisClient: any = null;

async function initRedis() {
  try {
    const Redis = (await import('ioredis')).default;
    const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 3000,
      retryStrategy: () => null, // Don't retry — just fail fast
    });
    client.on('error', () => {}); // Suppress error events
    await client.connect();
    await client.ping();
    redisAvailable = true;
    redisClient = client;
    logger.info('Redis connected successfully');
  } catch {
    redisAvailable = false;
    redisClient = null;
    logger.info('Redis not available — running without cache');
  }
}

// Fire and forget — server starts regardless
initRedis();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisAvailable || !redisClient) return null;
  try {
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  if (!redisAvailable || !redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {}
}

export async function cacheDelete(pattern: string): Promise<void> {
  if (!redisAvailable || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(...keys);
  } catch {}
}

export async function cacheFlushTrip(tripId: string): Promise<void> {
  await cacheDelete(`trip:${tripId}*`);
  await cacheDelete(`budget:${tripId}`);
}

// Export a dummy object so imports like `import redis from ...` don't break
export const redis = { connected: false };
export default redis;
