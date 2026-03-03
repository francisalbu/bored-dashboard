import { ExperienceInsert } from './experienceService';

// ─────────────────────────────────────────────────────────────────────────────
// Viator Partner API v2 — Service for importing experiences
// ─────────────────────────────────────────────────────────────────────────────

const VIATOR_API_KEY = '0a9b6163-6d27-4f03-bab6-e5debd3d7a8c';
const VIATOR_BASE_URL = 'https://api.viator.com/partner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ViatorImageVariant {
  height: number;
  width: number;
  url: string;
}

interface ViatorImage {
  imageSource: string;
  caption: string;
  isCover: boolean;
  variants: ViatorImageVariant[];
}

interface ViatorInclusion {
  category: string;
  categoryDescription: string;
  type: string;
  typeDescription: string;
  otherDescription?: string;
}

interface ViatorDestination {
  ref: string;
  primary: boolean;
}

interface ViatorReviews {
  totalReviews: number;
  combinedAverageRating: number;
}

interface ViatorProductOption {
  productOptionCode: string;
  description: string;
  title: string;
}

interface ViatorCancellationPolicy {
  type: string;
  description: string;
}

interface ViatorDuration {
  fixedDurationInMinutes?: number;
  variableDurationFromMinutes?: number;
  variableDurationToMinutes?: number;
}

interface ViatorLogistics {
  start?: Array<{
    location: { ref: string };
    description: string;
  }>;
  end?: Array<{
    location: { ref: string };
    description: string;
  }>;
  travelerPickup?: {
    pickupOptionType: string;
    additionalInfo?: string;
  };
}

interface ViatorProduct {
  status: string;
  productCode: string;
  title: string;
  description: string;
  images: ViatorImage[];
  inclusions?: ViatorInclusion[];
  exclusions?: ViatorInclusion[];
  additionalInfo?: Array<{ type: string; description: string }>;
  cancellationPolicy: ViatorCancellationPolicy;
  logistics: ViatorLogistics;
  destinations: ViatorDestination[];
  itinerary?: {
    duration?: ViatorDuration;
    itineraryType?: string;
  };
  productOptions?: ViatorProductOption[];
  reviews: ViatorReviews;
  bookingRequirements?: {
    minTravelersPerBooking?: number;
    maxTravelersPerBooking?: number;
  };
  supplier?: {
    name: string;
  };
  productUrl?: string;
  tags?: number[];
  languageGuides?: Array<{
    type: string;
    language: string;
  }>;
}

interface ViatorAvailabilityResponse {
  productCode: string;
  currency: string;
  summary: {
    fromPrice: number;
  };
}

export interface ViatorImportResult {
  product: ViatorProduct;
  price: number;
  currency: string;
  experience: ExperienceInsert;
  /** Direct link to the product page on viator.com (no affiliate landing redirect) */
  directProductUrl: string;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

async function viatorGet<T>(path: string): Promise<T> {
  const res = await fetch(`${VIATOR_BASE_URL}${path}`, {
    headers: {
      'exp-api-key': VIATOR_API_KEY,
      'Accept-Language': 'en-US',
      'Accept': 'application/json;version=2.0',
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Viator API error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// ─── Extract product code from URL or raw code ──────────────────────────────

export function extractProductCode(input: string): string | null {
  const trimmed = input.trim();

  // Direct product code (e.g., "156455P1")
  if (/^\d+P\d+$/i.test(trimmed)) {
    return trimmed;
  }

  // URL pattern: .../d538-156455P1 or similar
  const urlMatch = trimmed.match(/d\d+-(\d+P\d+)/i);
  if (urlMatch) return urlMatch[1];

  // Fallback: look for product code pattern anywhere
  const codeMatch = trimmed.match(/(\d+P\d+)/i);
  if (codeMatch) return codeMatch[1];

  return null;
}

// ─── Fetch product details ──────────────────────────────────────────────────

export async function fetchViatorProduct(productCode: string): Promise<ViatorProduct> {
  // target-lander=NONE ensures productUrl goes directly to the product page
  // instead of a generic affiliate landing/search page
  return viatorGet<ViatorProduct>(`/products/${productCode}?target-lander=NONE`);
}

// ─── Fetch pricing ──────────────────────────────────────────────────────────

export async function fetchViatorPricing(productCode: string): Promise<{ price: number; currency: string }> {
  try {
    const data = await viatorGet<ViatorAvailabilityResponse>(
      `/availability/schedules/${productCode}`
    );
    return {
      price: data.summary?.fromPrice || 0,
      currency: data.currency || 'EUR',
    };
  } catch {
    // Fallback: return 0 if pricing unavailable
    return { price: 0, currency: 'EUR' };
  }
}

// ─── Map Viator product → ExperienceInsert ──────────────────────────────────

function getBestImageUrl(image: ViatorImage): string {
  // Prefer 720x480 for main image
  const preferred = image.variants.find(v => v.width === 720);
  if (preferred) return preferred.url;
  // Fallback to largest
  const sorted = [...image.variants].sort((a, b) => b.width - a.width);
  return sorted[0]?.url || '';
}

function formatDuration(itinerary?: ViatorProduct['itinerary']): string {
  const dur = itinerary?.duration;
  if (!dur) return '';

  if (dur.fixedDurationInMinutes) {
    const mins = dur.fixedDurationInMinutes;
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h${m}min` : `${h}h`;
    }
    return `${mins}min`;
  }

  if (dur.variableDurationFromMinutes && dur.variableDurationToMinutes) {
    const from = dur.variableDurationFromMinutes;
    const to = dur.variableDurationToMinutes;
    const fmtMin = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? m % 60 + 'min' : ''}` : `${m}min`;
    return `${fmtMin(from)} – ${fmtMin(to)}`;
  }

  return '';
}

function extractLanguages(product: ViatorProduct): string[] {
  const langs = new Set<string>();
  const langMap: Record<string, string> = {
    en: 'English', pt: 'Portuguese', es: 'Spanish', fr: 'French',
    de: 'German', it: 'Italian', nl: 'Dutch', ja: 'Japanese',
    zh: 'Chinese', ar: 'Arabic', ko: 'Korean', ru: 'Russian',
  };

  // From language guides
  product.languageGuides?.forEach(g => {
    const name = langMap[g.language] || g.language;
    langs.add(name);
  });

  // From product options' language guides
  product.productOptions?.forEach(opt => {
    (opt as any).languageGuides?.forEach((g: any) => {
      const name = langMap[g.language] || g.language;
      langs.add(name);
    });
  });

  return langs.size > 0 ? Array.from(langs) : ['English'];
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Build a direct product page URL from the API productUrl.
 * Strips affiliate landing-page redirect params and adds target_lander=NONE
 * so the link goes directly to the product detail page on viator.com
 * while still preserving affiliate attribution (mcid/pid).
 */
function buildDirectProductUrl(productUrl: string | undefined, productCode: string): string {
  if (!productUrl) {
    // Construct a basic direct URL from the product code
    return `https://www.viator.com/search/156455P1`;
  }

  try {
    const url = new URL(productUrl);
    // Ensure target_lander=NONE is present to bypass the affiliate landing page
    url.searchParams.set('target_lander', 'NONE');
    return url.toString();
  } catch {
    // Fallback: just append target_lander param
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}target_lander=NONE`;
  }
}

export function mapViatorToExperience(
  product: ViatorProduct,
  pricing: { price: number; currency: string },
  operatorId: number
): ExperienceInsert {
  // Cover image
  const coverImage = product.images.find(i => i.isCover) || product.images[0];
  const imageUrl = coverImage ? getBestImageUrl(coverImage) : '';

  // All images (720x480)
  const allImages = product.images.map(getBestImageUrl).filter(Boolean);

  // Inclusions as highlights
  const highlights = product.inclusions
    ?.map(inc => inc.otherDescription || inc.typeDescription)
    .filter(Boolean) || [];

  // Included items
  const included = product.inclusions
    ?.map(inc => inc.otherDescription || inc.typeDescription)
    .filter(Boolean) || [];

  // Meeting point from logistics
  const meetingPoint = product.logistics?.start?.[0]?.description || '';

  // Clean description
  const description = stripHtml(product.description);
  const shortDescription = description.length > 200
    ? description.substring(0, 197) + '...'
    : description;

  return {
    operator_id: operatorId,
    title: product.title,
    description,
    short_description: shortDescription,
    location: 'Lisbon',
    address: '',
    meeting_point: meetingPoint,
    latitude: null,
    longitude: null,
    distance: null,
    city: 'Lisbon',
    price: pricing.price,
    currency: pricing.currency,
    duration: formatDuration(product.itinerary),
    max_group_size: product.bookingRequirements?.maxTravelersPerBooking || null,
    category: 'Culture Dive',
    tags: ['Viator', 'Food Tour', 'Lisbon'],
    video_url: null,
    image_url: imageUrl,
    images: allImages,
    provider_logo: null,
    highlights,
    included,
    what_to_bring: [],
    languages: extractLanguages(product),
    cancellation_policy: product.cancellationPolicy?.description || 'Free cancellation up to 24 hours in advance',
    important_info: product.additionalInfo
      ?.map(a => a.description)
      .join('. ') || '',
    instant_booking: true,
    available_today: true,
    verified: true,
    is_active: true,
    display_order: 999,
  };
}

// ─── Full import flow ────────────────────────────────────────────────────────

export async function importViatorProduct(
  input: string,
  operatorId: number
): Promise<ViatorImportResult> {
  const productCode = extractProductCode(input);
  if (!productCode) {
    throw new Error('Could not extract a valid Viator product code from the input. Use a Viator URL or product code like "156455P1".');
  }

  // Fetch product details and pricing in parallel
  const [product, pricing] = await Promise.all([
    fetchViatorProduct(productCode),
    fetchViatorPricing(productCode),
  ]);

  if (product.status !== 'ACTIVE') {
    throw new Error(`Product ${productCode} is not active (status: ${product.status})`);
  }

  const experience = mapViatorToExperience(product, pricing, operatorId);
  const directProductUrl = buildDirectProductUrl(product.productUrl, productCode);

  return { product, price: pricing.price, currency: pricing.currency, experience, directProductUrl };
}
