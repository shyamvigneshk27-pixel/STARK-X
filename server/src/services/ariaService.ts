import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { logger } from '../lib/logger';

// Ensure env vars are loaded before any client initialization
dotenv.config({ override: true });

let _anthropic: Anthropic | null = null;
let _openai: OpenAI | null = null;
let _gemini: GoogleGenAI | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
  return _anthropic;
}

function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  return _openai;
}

function getGemini(): GoogleGenAI {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  return _gemini;
}

export const ARIA_SYSTEM_PROMPT = `You are ARIA (AI Route & Itinerary Assistant), an expert travel planner. Your job is to create detailed, realistic, and exciting travel itineraries based on user preferences.

When creating an itinerary, you MUST:
1. Consider the budget carefully — distribute costs realistically.
2. Include a mix of activity types: sightseeing, food, culture, adventure, transport, accommodation.
3. Set realistic start times (no two activities at the same time in one day).
4. Estimate costs in USD.
5. Include at least 2-3 activities per day.

After your conversational response, output the machine-readable itinerary wrapped in <itinerary> tags as valid JSON:

<itinerary>
{
  "stops": [
    {
      "city": "CityName",
      "country": "CountryName",
      "arrivalDate": "YYYY-MM-DD",
      "departureDate": "YYYY-MM-DD",
      "activities": [
        {
          "name": "Activity Name",
          "type": "food|sightseeing|culture|adventure|nightlife|transport|accommodation",
          "estimatedCost": 0,
          "durationHrs": 2,
          "startTime": "09:00",
          "notes": "Optional notes about this activity"
        }
      ]
    }
  ],
  "totalEstimatedCost": 0,
  "travelTips": ["tip1", "tip2"]
}
</itinerary>

ALWAYS output the <itinerary> block, even in follow-up messages if the itinerary changes.`;

interface ItineraryActivity {
  name: string;
  type: string;
  estimatedCost: number;
  durationHrs: number;
  startTime?: string;
  notes?: string;
}

interface ItineraryStop {
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  activities: ItineraryActivity[];
}

interface ParsedItinerary {
  stops: ItineraryStop[];
  totalEstimatedCost: number;
  travelTips?: string[];
}

interface PlanOptions {
  trip: {
    name: string;
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    description?: string | null;
    stops: Array<{
      city: { name: string; country: string };
      arrivalDate: Date;
      departureDate: Date;
    }>;
  };
  userMessage: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  onChunk: (text: string) => void;
  onError: (message: string) => void;
  onItinerary: (itinerary: ParsedItinerary) => Promise<void>;
}

function parseItinerary(fullText: string): ParsedItinerary | null {
  try {
    const match = fullText.match(/<itinerary>([\s\S]*?)<\/itinerary>/);
    if (!match) return null;
    return JSON.parse(match[1].trim()) as ParsedItinerary;
  } catch {
    return null;
  }
}

function buildContextMessage(options: PlanOptions): string {
  const { trip, userMessage } = options;
  const totalDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)
  );

  return `Trip: "${trip.name}"
Duration: ${totalDays} days (${trip.startDate.toISOString().slice(0, 10)} to ${trip.endDate.toISOString().slice(0, 10)})
Budget: $${trip.totalBudget} USD
${trip.description ? `Description: ${trip.description}` : ''}
${trip.stops.length > 0 ? `Existing stops: ${trip.stops.map((s) => s.city.name).join(', ')}` : ''}

User request: ${userMessage}`;
}

async function tryAnthropic(
  contextMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk: (text: string) => void,
  attempt = 0
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user', content: contextMessage },
  ];

  let fullText = '';
  const stream = await getAnthropic().messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: ARIA_SYSTEM_PROMPT,
    messages,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullText;
}

async function tryOpenAI(
  contextMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk: (text: string) => void
): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: ARIA_SYSTEM_PROMPT },
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user', content: contextMessage },
  ];

  const stream = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages,
    max_tokens: 4096,
  });

  let fullText = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      fullText += text;
      onChunk(text);
    }
  }

  return fullText;
}

async function tryGemini(
  contextMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk: (text: string) => void
): Promise<string> {
  const contents = [
    ...history.map((h) => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: contextMessage }] },
  ];

  const stream = await getGemini().models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: contents as any,
    config: {
      systemInstruction: ARIA_SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  let fullText = '';
  for await (const chunk of stream) {
    if (chunk.text) {
      fullText += chunk.text;
      onChunk(chunk.text);
    }
  }

  return fullText;
}

export async function planTripWithAria(options: PlanOptions): Promise<void> {
  const { history, onChunk, onError, onItinerary } = options;
  const contextMessage = buildContextMessage(options);

  let fullText = '';
  let geminiSuccess = false;

  // 1. Try Gemini first
  try {
    fullText = await tryGemini(contextMessage, history, onChunk);
    geminiSuccess = true;
  } catch (err: unknown) {
    logger.warn('Gemini failed, falling back to Anthropic/OpenAI', { error: (err as Error).message });
  }

  // 2. Try Anthropic (with retries)
  let anthropicSuccess = false;
  if (!geminiSuccess) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        fullText = await tryAnthropic(contextMessage, history, onChunk, attempt);
        anthropicSuccess = true;
        break;
      } catch (err: unknown) {
        const error = err as { status?: number; message?: string };
        const isRetryable =
          !error.status || error.status === 529 || error.status === 503 || error.status === 500;

        if (!isRetryable || attempt === 1) {
          logger.warn('Anthropic failed, falling back to OpenAI', {
            error: error.message,
            status: error.status,
            attempt,
          });
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // 3. Fallback to OpenAI
  if (!geminiSuccess && !anthropicSuccess) {
    try {
      fullText = await tryOpenAI(contextMessage, history, onChunk);
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('All AI providers failed', { error: error.message });
      onError('All AI providers unavailable. Please try again shortly.');
      return;
    }
  }

  // Parse itinerary block
  const itinerary = parseItinerary(fullText);
  if (itinerary) {
    await onItinerary(itinerary);
  } else {
    // No structured itinerary — still end gracefully
    logger.warn('No itinerary block found in AI response', { textLength: fullText.length });
    // Signal done without saving
    onChunk(''); // flush
  }
}
