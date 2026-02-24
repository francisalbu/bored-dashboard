// ─────────────────────────────────────────────────────────────────────────────
// AI Description Generator — auto-complete experience fields from a title
//   User types "Bicycle tour" → AI fills description, highlights, tags, etc.
// ─────────────────────────────────────────────────────────────────────────────

const OPENAI_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENAI_API_KEY) || '';

export interface AIGeneratedFields {
  description: string;
  short_description: string;
  tags: string[];
  highlights: string[];
  included: string[];
  what_to_bring: string[];
  languages: string[];
  cancellation_policy: string;
  important_info: string;
  category: string;
  duration: string;
  image_query: string;
}

const STOCK_IMAGES: Record<string, string> = {
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'hot stone': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=800&q=80',
  yoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
  bike: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
  bicycle: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
  kayak: 'https://images.unsplash.com/photo-1526188717906-ab4a2f949f48?w=800&q=80',
  surf: 'https://images.unsplash.com/photo-1502680390548-bdbac40a5738?w=800&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  pool: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  sauna: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  restaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  dinner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',

  boat: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  hike: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  walk: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  tour: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80',
  sunset: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80',
  couples: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
};

function pickImage(title: string, tags: string[]): string {
  const search = [title, ...tags].join(' ').toLowerCase();
  for (const [kw, url] of Object.entries(STOCK_IMAGES)) {
    if (kw !== 'default' && search.includes(kw)) return url;
  }
  return STOCK_IMAGES.default;
}

// ── Main function ────────────────────────────────────────────────────────────

export async function generateExperienceFields(
  title: string,
  context?: { price?: number; category?: string; duration?: string; city?: string }
): Promise<AIGeneratedFields> {
  if (!OPENAI_KEY) {
    throw new Error('No OpenAI API key configured.');
  }

  const contextParts: string[] = [];
  if (context?.price) contextParts.push(`Price: €${context.price}`);
  if (context?.category) contextParts.push(`Category: ${context.category}`);
  if (context?.duration) contextParts.push(`Duration: ${context.duration}`);
  if (context?.city) contextParts.push(`City: ${context.city}`);
  const contextStr = contextParts.length > 0 ? `\nContext: ${contextParts.join(', ')}` : '';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You generate hotel experience listings. Given a title, return a JSON object with:
- description: 2-3 compelling marketing sentences
- short_description: under 80 chars, catchy one-liner
- category: best fit from [Spa & Wellness, Rentals, Packages, Outdoors, Sports, Mind & Body, Culture Dive, Night Explorer, Local Cooking, Learn & Create, Micro Adventures]
- duration: estimated (e.g. "2h", "50min", "Full day")
- tags: 3-4 relevant tags
- highlights: 4 key selling points
- included: SPECIFIC items included for THIS activity type. Examples:
  Kayak → ["Kayak & paddle", "Life jacket", "Waterproof bag", "Safety briefing"]
  Ski → ["Ski pass", "Ski equipment rental", "Helmet", "Instructor"]
  Motorcycle tour → ["Motorcycle", "Helmet", "Fuel", "Route map", "Support vehicle"]
  Massage → ["Robe & slippers", "Herbal tea", "Essential oils"]
  Cooking class → ["All ingredients", "Apron", "Recipe booklet", "Meal you cook"]
  Bike tour → ["Bicycle", "Helmet", "Water bottle", "Guide"]
  Wine tasting → ["6 wine samples", "Tasting notes", "Cheese & charcuterie board"]
  Be specific to the actual activity — don't use generic items.
- what_to_bring: SPECIFIC items guests need for THIS activity. Examples:
  Kayak → ["Swimsuit", "Towel", "Sunscreen", "Water shoes"]
  Ski → ["Warm layers", "Sunglasses", "Sunscreen", "Ski socks"]
  Motorcycle tour → ["Driving license", "Closed shoes", "Sunglasses"]
  Massage/Spa → [] (nothing needed)
  Cooking class → ["Appetite!"]
  Bike tour → ["Comfortable clothing", "Sunscreen", "Water"]
  Boat trip → ["Swimsuit", "Towel", "Sunscreen", "Light jacket"]
  Be realistic — only items guests actually need to bring themselves.
- languages: languages this experience would typically be available in. Consider the location. Example: a hotel in Lisbon → ["English", "Portuguese", "Spanish", "French"]. A hotel in Tokyo → ["English", "Japanese"]. Always include English. 3-5 languages.
- cancellation_policy: appropriate policy
- important_info: 1 line of key info specific to this activity
- image_query: 2-3 word photo search term
Write in English, professional hotel tone. Return ONLY raw JSON, no markdown.`,
          },
          {
            role: 'user',
            content: `Title: "${title}"${contextStr}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.4,
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error: ${res.status}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Pick an image based on the title + tags
    const imageUrl = pickImage(title, parsed.tags || []);

    return {
      description: parsed.description || '',
      short_description: parsed.short_description || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      included: Array.isArray(parsed.included) ? parsed.included : [],
      what_to_bring: Array.isArray(parsed.what_to_bring) ? parsed.what_to_bring : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : ['English'],
      cancellation_policy: parsed.cancellation_policy || 'Free cancellation up to 24 hours in advance',
      important_info: parsed.important_info || '',
      category: parsed.category || context?.category || '',
      duration: parsed.duration || context?.duration || '',
      image_query: parsed.image_query || title,
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

export function hasOpenAIKey(): boolean {
  return !!OPENAI_KEY;
}
