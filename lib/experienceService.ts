import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Experience types — FULL schema matching Supabase `experiences` table
// ─────────────────────────────────────────────────────────────────────────────

export interface ExperienceRow {
  id: number;
  operator_id: number;
  title: string;
  description: string;
  short_description: string | null;
  location: string;
  address: string;
  meeting_point: string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  city: string | null;
  price: number;
  currency: string;
  duration: string;
  max_group_size: number | null;
  category: string;
  tags: string[] | null;
  video_url: string | null;
  image_url: string;
  images: string[] | null;
  provider_logo: string | null;
  highlights: string[] | null;
  included: string[] | null;
  what_to_bring: string[] | null;
  languages: string[] | null;
  cancellation_policy: string | null;
  important_info: string | null;
  instant_booking: boolean;
  available_today: boolean;
  verified: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  view_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// For creating a new experience (hotel operator's own)
export type ExperienceInsert = Omit<ExperienceRow, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'view_count'>;

// Default blank experience for the "create" form
export const BLANK_EXPERIENCE: Omit<ExperienceInsert, 'operator_id'> = {
  title: '',
  description: '',
  short_description: '',
  location: '',
  address: '',
  meeting_point: '',
  latitude: null,
  longitude: null,
  distance: null,
  city: '',
  price: 0,
  currency: 'EUR',
  duration: '',
  max_group_size: null,
  category: '',
  tags: [],
  video_url: null,
  image_url: '',
  images: [],
  provider_logo: null,
  highlights: [],
  included: [],
  what_to_bring: [],
  languages: [],
  cancellation_policy: 'Free cancellation up to 24 hours in advance for a full refund',
  important_info: '',
  instant_booking: true,
  available_today: true,
  verified: false,
  is_active: true,
  display_order: 999,
};

// ─────────────────────────────────────────────────────────────────────────────
// Fetch ALL experiences (bored. marketplace — read-only for hotel operator)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllExperiences(): Promise<ExperienceRow[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }

  return data as ExperienceRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch experiences by category (for hotel service sections)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchExperiencesByCategory(category: string): Promise<ExperienceRow[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('category', category)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching experiences by category:', error);
    return [];
  }

  return data as ExperienceRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch a single experience by ID
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchExperienceById(id: number): Promise<ExperienceRow | null> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching experience:', error);
    return null;
  }

  return data as ExperienceRow;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle experience visibility
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleExperienceActive(
  id: number,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('experiences')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    console.error('Error toggling experience:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update display order for multiple experiences (batch)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateExperienceOrder(
  orderedIds: { id: number; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const updates = orderedIds.map(({ id, display_order }) =>
    supabase.from('experiences').update({ display_order }).eq('id', id)
  );

  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);

  if (failed?.error) {
    console.error('Error updating order:', failed.error);
    return { success: false, error: failed.error.message };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Create a new experience (hotel operator creates their own)
// ─────────────────────────────────────────────────────────────────────────────

export async function createExperience(
  experience: ExperienceInsert
): Promise<{ success: boolean; data?: ExperienceRow; error?: string }> {
  const { data, error } = await supabase
    .from('experiences')
    .insert(experience)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating experience:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ExperienceRow };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update an existing experience (only own experiences)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateExperience(
  id: number,
  updates: Partial<ExperienceRow>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('experiences')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating experience:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete an experience
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteExperience(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting experience:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
