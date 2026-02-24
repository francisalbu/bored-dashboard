// ─────────────────────────────────────────────────────────────────────────────
// Shared types between Dashboard ↔ Website
// These mirror the HotelConfig interface in the website's hotelConfig.ts
// AND the hotel_config Supabase table
// ─────────────────────────────────────────────────────────────────────────────

export interface HotelTheme {
  primaryColor: string;
  primaryTextColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  fontHeading: string;
  fontBody: string;
}

export interface StaffMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  preferredCategories: string[];
}

export interface ActivityPreferences {
  preferredCategories?: string[];
  priceRange?: { min?: number; max?: number };
  style: 'adventure' | 'cultural' | 'luxury' | 'family' | 'mixed';
}

export interface SiteFeatures {
  showActivities: boolean;
  showSpa: boolean;
  showRentals: boolean;
  showReviews: boolean;
  showHotelPicks: boolean;
  showPreArrival: boolean;
  enableInstantBooking: boolean;
}

export interface QuickSuggestion {
  emoji: string;
  label: string;
  prompt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Bot Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeEntry {
  id: string;
  title: string;
  type: 'text' | 'menu' | 'policy' | 'service' | 'faq';
  content: string;
}

export type BotPersonality = 'premium' | 'casual' | 'friendly' | 'professional' | 'adventurous';
export type SalesAggressiveness = 'soft' | 'balanced' | 'aggressive';
export type ResponseLength = 'short' | 'medium' | 'long';

export interface BotConfig {
  botName: string;
  personality: BotPersonality;
  language: 'auto' | 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it';
  toneDescription: string;
  customInstructions: string;
  restrictions: string[];
  knowledgeEntries: KnowledgeEntry[];
  salesAggressiveness: SalesAggressiveness;
  maxResponseLength: ResponseLength;
}

export interface HotelConfig {
  id: string;
  name: string;
  tagline: string;
  location: string;
  logoUrl: string;
  conciergeAvatarUrl: string;
  latitude: number | null;
  longitude: number | null;
  theme: HotelTheme;
  staffMembers: StaffMember[];
  activityPreferences: ActivityPreferences;
  features: SiteFeatures;
  // Welcome / Concierge content
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDescription: string;
  quickSuggestions: QuickSuggestion[];
  // AI Bot
  botConfig: BotConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database row shape (snake_case, matches Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export interface HotelConfigRow {
  id: string;
  name: string;
  tagline: string;
  location: string;
  logo_url: string;
  concierge_avatar_url: string;
  latitude: number | null;
  longitude: number | null;
  theme: HotelTheme;
  staff_members: StaffMember[];
  activity_preferences: ActivityPreferences;
  features: SiteFeatures;
  welcome_title: string;
  welcome_subtitle: string;
  welcome_description: string;
  quick_suggestions: QuickSuggestion[];
  bot_config: BotConfig;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────────────────────

export function rowToConfig(row: HotelConfigRow): HotelConfig {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    location: row.location || '',
    logoUrl: row.logo_url || '',
    conciergeAvatarUrl: row.concierge_avatar_url || '',
    latitude: row.latitude,
    longitude: row.longitude,
    theme: row.theme,
    staffMembers: row.staff_members || [],
    activityPreferences: row.activity_preferences || { style: 'mixed' },
    features: row.features || DEFAULT_FEATURES,
    welcomeTitle: row.welcome_title || 'Welcome to',
    welcomeSubtitle: row.welcome_subtitle || '',
    welcomeDescription: row.welcome_description || "I'm your digital concierge. Ask me anything about the city, or let me find your next adventure.",
    quickSuggestions: row.quick_suggestions || DEFAULT_QUICK_SUGGESTIONS,
    botConfig: row.bot_config || DEFAULT_BOT_CONFIG,
  };
}

export function configToRow(config: HotelConfig): Omit<HotelConfigRow, 'created_at' | 'updated_at'> {
  return {
    id: config.id,
    name: config.name,
    tagline: config.tagline,
    location: config.location,
    logo_url: config.logoUrl,
    concierge_avatar_url: config.conciergeAvatarUrl,
    latitude: config.latitude,
    longitude: config.longitude,
    theme: config.theme,
    staff_members: config.staffMembers,
    activity_preferences: config.activityPreferences,
    features: config.features,
    welcome_title: config.welcomeTitle,
    welcome_subtitle: config.welcomeSubtitle,
    welcome_description: config.welcomeDescription,
    quick_suggestions: config.quickSuggestions,
    bot_config: config.botConfig,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_THEME: HotelTheme = {
  primaryColor: '#0f172a',
  primaryTextColor: '#ffffff',
  accentColor: '#10b981',
  backgroundColor: '#FAFAF8',
  surfaceColor: '#ffffff',
  fontHeading: 'Inter',
  fontBody: 'Inter',
};

export const DEFAULT_FEATURES: SiteFeatures = {
  showActivities: true,
  showSpa: true,
  showRentals: true,
  showReviews: true,
  showHotelPicks: true,
  showPreArrival: true,
  enableInstantBooking: true,
};

export const DEFAULT_QUICK_SUGGESTIONS: QuickSuggestion[] = [
  { emoji: '🗓️', label: '2 Day Itinerary', prompt: 'What do you recommend for a 2 day stay?' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Family Activities', prompt: 'What can I do as a family of 4?' },
  { emoji: '🤿', label: 'Diving Spots', prompt: 'We want to do dive, where can we go?' },
];

export const DEFAULT_BOT_CONFIG: BotConfig = {
  botName: 'Concierge',
  personality: 'friendly',
  language: 'auto',
  toneDescription: '',
  customInstructions: '',
  restrictions: [],
  knowledgeEntries: [],
  salesAggressiveness: 'balanced',
  maxResponseLength: 'medium',
};

export const FONT_OPTIONS = [
  'Inter',
  'Playfair Display',
  'Poppins',
  'Lora',
  'Lato',
  'DM Sans',
  'DM Serif Display',
  'Merriweather',
  'Montserrat',
  'Roboto',
];
