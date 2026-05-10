import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';

const router = Router();

// ── GET /api/cities ───────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const region = (req.query.region as string) || '';
  const maxCost = req.query.maxCost ? parseFloat(req.query.maxCost as string) : undefined;
  const sort = (req.query.sort as string) || 'popularity';

  if (!q && !region && !maxCost) {
    res.json([]);
    return;
  }

  const cacheKey = `cities:q:${q}:${region}:${maxCost ?? ''}:${sort}`;
  const cached = await cacheGet<unknown[]>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql');
  const mode = isPostgres ? ('insensitive' as const) : undefined;

  const whereClause: Record<string, unknown> = {};

  if (q) {
    whereClause.OR = [
      { name: mode ? { contains: q, mode } : { contains: q } },
      { country: mode ? { contains: q, mode } : { contains: q } },
    ];
  }

  if (region) {
    whereClause.region = mode ? { contains: region, mode } : { contains: region };
  }

  if (maxCost !== undefined) {
    whereClause.costIndex = { lte: maxCost };
  }

  const orderByMap: Record<string, object> = {
    popularity: { popularity: 'desc' },
    name: { name: 'asc' },
    cost: { costIndex: 'asc' },
  };

  const cities = await prisma.city.findMany({
    where: whereClause as Parameters<typeof prisma.city.findMany>[0]['where'],
    take: 20,
    orderBy: orderByMap[sort] ?? { popularity: 'desc' },
  });

  await cacheSet(cacheKey, cities, 600);
  res.json(cities);
});

// ── GET /api/cities/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `city:${id}`;

  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const city = await prisma.city.findUnique({
    where: { id },
    include: {
      templates: true,
      _count: { select: { stops: true } },
    },
  });

  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }

  await cacheSet(cacheKey, city, 600);
  res.json(city);
});

export default router;
