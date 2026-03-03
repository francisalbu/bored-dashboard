import { supabase } from './supabase';
import {
  HotelConfig,
  HotelConfigRow,
  rowToConfig,
  configToRow,
  DEFAULT_THEME,
  DEFAULT_FEATURES,
} from './hotelConfigTypes';

// ─────────────────────────────────────────────────────────────────────────────
// READ — fetch a single hotel config
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHotelConfig(hotelId: string): Promise<HotelConfig | null> {
  const { data, error } = await supabase
    .from('hotel_config')
    .select('*')
    .eq('id', hotelId)
    .single();

  if (error) {
    console.error('Error fetching hotel config:', error);
    return null;
  }

  return rowToConfig(data as HotelConfigRow);
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST — fetch all hotel configs (for a hotel selector dropdown)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllHotelConfigs(): Promise<HotelConfig[]> {
  const { data, error } = await supabase
    .from('hotel_config')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching hotel configs:', error);
    return [];
  }

  return (data as HotelConfigRow[]).map(rowToConfig);
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE — upsert (create or update) a hotel config
// ─────────────────────────────────────────────────────────────────────────────

export async function saveHotelConfig(config: HotelConfig): Promise<{ success: boolean; error?: string }> {
  const row = configToRow(config);
  // Use UPDATE (not upsert) — hotel rows are created by migrations, not by the dashboard.
  // Upsert would fail if the user doesn't have INSERT permission (RLS).
  const { id, ...fields } = row;

  const { error } = await supabase
    .from('hotel_config')
    .update(fields)
    .eq('id', id);

  if (error) {
    console.error('Error saving hotel config:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteHotelConfig(hotelId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('hotel_config')
    .delete()
    .eq('id', hotelId);

  if (error) {
    console.error('Error deleting hotel config:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
