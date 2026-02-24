// ─────────────────────────────────────────────────────────────────────────────
// Bulk Experience Extractor — AI-powered parsing of PDF/menu content
//   Uses Gemini or OpenAI to identify experiences from hotel documents
//   (spa menus, activity brochures, rental lists, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { ExperienceInsert, BLANK_EXPERIENCE } from './experienceService';

const OPENAI_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENAI_API_KEY) || '';

const GEMINI_KEY =
  (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  '';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedExperience {
  id: string; // temp client-side ID
  selected: boolean;
  title: string;
  description: string;
  short_description: string;
  price: number;
  currency: string;
  duration: string;
  category: string;
  tags: string[];
  highlights: string[];
  included: string[];
  image_url: string;
  image_query: string; // search term for stock photo
}

export interface ExtractionProgress {
  stage: 'reading' | 'analyzing' | 'generating' | 'images' | 'done' | 'error';
  message: string;
  percent: number;
}

// ── Stock photo helper ───────────────────────────────────────────────────────

const UNSPLASH_IMAGES: Record<string, string> = {
  'massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'hot stone': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  'facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  'spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=800&q=80',
  'sauna': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  'pool': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  'yoga': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
  'meditation': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  'manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
  'pedicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
  'body wrap': 'https://images.unsplash.com/photo-1596178060810-72f53ce9a65c?w=800&q=80',
  'scrub': 'https://images.unsplash.com/photo-1596178060810-72f53ce9a65c?w=800&q=80',
  'aromatherapy': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  'reflexology': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  'couples': 'https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=800&q=80',
  'wellness': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'treatment': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  'jacuzzi': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  'turkish bath': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  'hammam': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  'bamboo': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  'deep tissue': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  'ayurvedic': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  'shiatsu': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  'prenatal': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'exfoliation': 'https://images.unsplash.com/photo-1596178060810-72f53ce9a65c?w=800&q=80',
  'bike': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
  'kayak': 'https://images.unsplash.com/photo-1526188717906-ab4a2f949f48?w=800&q=80',
  'surf': 'https://images.unsplash.com/photo-1502680390548-bdbac40a5738?w=800&q=80',
  'restaurant': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'dinner': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',

  'default': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
};

function findBestImage(title: string, tags: string[]): string {
  const searchTerms = [title, ...tags].join(' ').toLowerCase();
  for (const [keyword, url] of Object.entries(UNSPLASH_IMAGES)) {
    if (keyword !== 'default' && searchTerms.includes(keyword)) {
      return url;
    }
  }
  return UNSPLASH_IMAGES['default'];
}

// ── Main extraction function ─────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 30_000; // keep it tight — less input = faster response

/** Aggressively clean and compress extracted PDF text */
function compressText(text: string): string {
  return text
    .replace(/\[Page \d+\]\n?/g, '\n')       // remove page markers
    .replace(/[^\S\n]+/g, ' ')                // collapse whitespace
    .replace(/\n{3,}/g, '\n\n')              // collapse blank lines
    .replace(/\b(www\.\S+|https?:\/\/\S+)/gi, '') // strip URLs
    .replace(/[©®™●•·—–]/g, '')              // strip decorative chars
    .replace(/\b(all rights reserved|terms.{0,20}conditions|privacy policy)\b/gi, '') // strip legal
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 60_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Lean prompt — asks for minimal fields, fast to generate
const FAST_PROMPT = (categoryHint: string, locationHint: string) =>
`Extract every service/treatment/activity from this hotel document as a JSON array.
For each, return: title, description (2 sentences max), short_description (under 80 chars), price (number), currency (default EUR), duration (e.g. "50min"), category (one of: Spa & Wellness, Rentals, Packages, Outdoors, Sports, Mind & Body), tags (2-3 strings), highlights (3 bullet points), included (what's included), image_query (2-3 word photo search term).
${categoryHint} ${locationHint}
If multiple durations exist for the same service, use the standard one. Prices must be numbers only. Write in English. Return ONLY a raw JSON array, no markdown.`;

// ── Gemini API call ──────────────────────────────────────────────────────────

async function callGemini(text: string, categoryHint: string, locationHint: string): Promise<string> {
  console.log('[BulkExtractor] Using Gemini Flash Lite (fastest)...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`;

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${FAST_PROMPT(categoryHint, locationHint)}\n\nDOCUMENT:\n${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8000,
        responseMimeType: 'application/json',
      },
    }),
  }, 45_000); // 45s timeout — flash-lite is very fast

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Gemini API error: ${res.status}`;
    console.error('[BulkExtractor] Gemini error:', msg);
    throw new Error(msg);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('[BulkExtractor] Gemini response length:', content.length);
  return content;
}

// ── OpenAI API call ──────────────────────────────────────────────────────────

async function callOpenAI(text: string, categoryHint: string, locationHint: string): Promise<string> {
  console.log('[BulkExtractor] Using OpenAI API...');

  const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: FAST_PROMPT(categoryHint, locationHint) },
        {
          role: 'user',
          content: `DOCUMENT:\n${text}`,
        },
      ],
      max_tokens: 8000,
      temperature: 0.2,
    }),
  }, 60_000);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `OpenAI API error: ${res.status}`;
    console.error('[BulkExtractor] OpenAI error:', msg);
    throw new Error(msg);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  console.log('[BulkExtractor] OpenAI response length:', content.length);
  return content;
}

// ── Main function ────────────────────────────────────────────────────────────

export async function extractExperiencesFromText(
  text: string,
  onProgress?: (progress: ExtractionProgress) => void,
  hotelContext?: { name?: string; city?: string; category?: string }
): Promise<ExtractedExperience[]> {
  const hasGemini = !!GEMINI_KEY;
  const hasOpenAI = !!OPENAI_KEY;

  console.log('[BulkExtractor] Keys available — Gemini:', hasGemini, '| OpenAI:', hasOpenAI);
  console.log('[BulkExtractor] Raw text length:', text.length);

  if (!hasGemini && !hasOpenAI) {
    throw new Error('No AI API key found. Add GEMINI_API_KEY or VITE_OPENAI_API_KEY to your .env file.');
  }

  // Clean and compress the text aggressively for speed
  const processedText = compressText(text);
  console.log('[BulkExtractor] Compressed text length:', processedText.length, `(${Math.round((1 - processedText.length / text.length) * 100)}% smaller)`);

  if (processedText.trim().length < 50) {
    throw new Error(
      'Very little text was extracted from this document. It may be image-based — try uploading as an image (JPG/PNG) instead of PDF.'
    );
  }

  onProgress?.({
    stage: 'analyzing',
    message: hasGemini ? 'AI is analyzing the document...' : 'AI is analyzing the document...',
    percent: 20,
  });

  const categoryHint = hotelContext?.category
    ? `The hotel categorizes these as "${hotelContext.category}".`
    : '';
  const locationHint = hotelContext?.city
    ? `The hotel is located in ${hotelContext.city}.`
    : '';

  // Try OpenAI first (faster), fallback to Gemini
  let content = '';
  try {
    if (hasOpenAI) {
      content = await callOpenAI(processedText, categoryHint, locationHint);
    } else {
      content = await callGemini(processedText, categoryHint, locationHint);
    }
  } catch (primaryErr: any) {
    console.warn('[BulkExtractor] Primary API failed:', primaryErr.message);

    // Fallback
    const hasFallback = hasOpenAI ? hasGemini : hasOpenAI;
    if (hasFallback) {
      console.log('[BulkExtractor] Falling back...');
      onProgress?.({
        stage: 'analyzing',
        message: 'Retrying with backup AI...',
        percent: 30,
      });
      try {
        content = hasOpenAI
          ? await callGemini(processedText, categoryHint, locationHint)
          : await callOpenAI(processedText, categoryHint, locationHint);
      } catch (fallbackErr: any) {
        throw new Error(`Both AI providers failed. Last error: ${fallbackErr.message}`);
      }
    } else {
      throw primaryErr;
    }
  }

  onProgress?.({
    stage: 'generating',
    message: 'Structuring experiences...',
    percent: 60,
  });

  console.log('[BulkExtractor] Raw AI response:', content.slice(0, 200), '...');

  // Parse the JSON response — handle possible markdown wrapping
  let parsed: any[];
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('[BulkExtractor] Failed to parse AI response:', content.slice(0, 500));
    throw new Error('AI returned invalid data. Please try again.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('No experiences found in the document. Try a different file.');
  }

  onProgress?.({
    stage: 'images',
    message: `Found ${parsed.length} experiences! Assigning images...`,
    percent: 80,
  });

  // Map to ExtractedExperience with images
  const experiences: ExtractedExperience[] = parsed.map((item, idx) => ({
    id: `bulk-${Date.now()}-${idx}`,
    selected: true,
    title: item.title || `Experience ${idx + 1}`,
    description: item.description || '',
    short_description: item.short_description || '',
    price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
    currency: item.currency || 'EUR',
    duration: item.duration || '',
    category: item.category || hotelContext?.category || 'Spa & Wellness',
    tags: Array.isArray(item.tags) ? item.tags : [],
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
    included: Array.isArray(item.included) ? item.included : [],
    image_url: findBestImage(item.title || '', item.tags || []),
    image_query: item.image_query || item.title || '',
  }));

  onProgress?.({
    stage: 'done',
    message: `Successfully extracted ${experiences.length} experiences!`,
    percent: 100,
  });

  return experiences;
}

// ── Convert extracted experience to ExperienceInsert ──────────────────────────

export function toExperienceInsert(
  extracted: ExtractedExperience,
  operatorId: number,
  defaults?: { location?: string; address?: string; city?: string }
): ExperienceInsert {
  return {
    ...BLANK_EXPERIENCE,
    operator_id: operatorId,
    title: extracted.title,
    description: extracted.description,
    short_description: extracted.short_description,
    price: extracted.price,
    currency: extracted.currency,
    duration: extracted.duration,
    category: extracted.category,
    tags: extracted.tags,
    highlights: extracted.highlights,
    included: extracted.included,
    image_url: extracted.image_url,
    images: [extracted.image_url],
    location: defaults?.location || '',
    address: defaults?.address || '',
    city: defaults?.city || '',
    meeting_point: '',
    is_active: true,
    instant_booking: true,
    available_today: true,
    display_order: 999,
  };
}

export function hasAIKey(): boolean {
  return !!GEMINI_KEY || !!OPENAI_KEY;
}
