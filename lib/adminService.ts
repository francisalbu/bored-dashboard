import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'super_admin' | 'hotel_admin' | 'staff';
  created_at: string;
  hotels: { hotel_id: string; hotel_name: string; role: string }[];
}

export interface HotelWithUsers {
  id: string;
  name: string;
  location: string;
  logo_url: string | null;
  group_id: string | null;
  group_name: string | null;
  users: { user_id: string; email: string; full_name: string | null; role: string }[];
}

export interface HotelGroup {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  hotel_count?: number;
}

export interface PendingInvite {
  id: string;
  email: string;
  hotel_id: string;
  hotel_name: string;
  role: string;
  created_at: string;
  accepted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Users
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllDashboardUsers(): Promise<DashboardUser[]> {
  // Fetch users
  const { data: users, error: ue } = await supabase
    .from('dashboard_users')
    .select('id, email, full_name, avatar_url, role, created_at')
    .order('created_at', { ascending: false });

  if (ue || !users) return [];

  // Fetch all hotel assignments
  const { data: assignments } = await supabase
    .from('dashboard_user_hotels')
    .select('user_id, hotel_id, role, hotel_config(name)');

  const assignMap: Record<string, DashboardUser['hotels']> = {};
  for (const a of assignments || []) {
    if (!assignMap[a.user_id]) assignMap[a.user_id] = [];
    assignMap[a.user_id].push({
      hotel_id: a.hotel_id,
      hotel_name: (a.hotel_config as any)?.name || a.hotel_id,
      role: a.role,
    });
  }

  return users.map(u => ({ ...u, hotels: assignMap[u.id] || [] }));
}

export async function updateDashboardUserRole(
  userId: string,
  role: 'super_admin' | 'hotel_admin' | 'staff'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('dashboard_users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return error ? { success: false, error: error.message } : { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hotel ↔ User assignments
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllHotelsWithUsers(): Promise<HotelWithUsers[]> {
  const { data: hotels, error: he } = await supabase
    .from('hotel_config')
    .select('id, name, location, logo_url, group_id, hotel_groups(name)')
    .order('name');

  if (he || !hotels) return [];

  const { data: assignments } = await supabase
    .from('dashboard_user_hotels')
    .select('user_id, hotel_id, role, dashboard_users(email, full_name)');

  const userMap: Record<string, HotelWithUsers['users']> = {};
  for (const a of assignments || []) {
    if (!userMap[a.hotel_id]) userMap[a.hotel_id] = [];
    userMap[a.hotel_id].push({
      user_id: a.user_id,
      email: (a.dashboard_users as any)?.email || '',
      full_name: (a.dashboard_users as any)?.full_name || null,
      role: a.role,
    });
  }

  return hotels.map((h: any) => ({
    id: h.id,
    name: h.name,
    location: h.location || '',
    logo_url: h.logo_url || null,
    group_id: h.group_id || null,
    group_name: h.hotel_groups?.name || null,
    users: userMap[h.id] || [],
  }));
}

export async function assignUserToHotel(
  userId: string,
  hotelId: string,
  role: 'owner' | 'admin' | 'staff' = 'admin'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('dashboard_user_hotels')
    .upsert({ user_id: userId, hotel_id: hotelId, role }, { onConflict: 'user_id,hotel_id' });

  return error ? { success: false, error: error.message } : { success: true };
}

export async function removeUserFromHotel(
  userId: string,
  hotelId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('dashboard_user_hotels')
    .delete()
    .eq('user_id', userId)
    .eq('hotel_id', hotelId);

  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateUserHotelRole(
  userId: string,
  hotelId: string,
  role: 'owner' | 'admin' | 'staff'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('dashboard_user_hotels')
    .update({ role })
    .eq('user_id', userId)
    .eq('hotel_id', hotelId);

  return error ? { success: false, error: error.message } : { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Invites — stored in dashboard_invites table
// When user signs up, the trigger auto-assigns their hotel via this table
// ─────────────────────────────────────────────────────────────────────────────

export async function createInvite(
  email: string,
  hotelId: string,
  role: 'admin' | 'staff' = 'admin'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('dashboard_invites')
    .upsert(
      { email: email.toLowerCase().trim(), hotel_id: hotelId, role, accepted: false },
      { onConflict: 'email,hotel_id' }
    );

  return error ? { success: false, error: error.message } : { success: true };
}

export async function fetchPendingInvites(): Promise<PendingInvite[]> {
  const { data, error } = await supabase
    .from('dashboard_invites')
    .select('id, email, hotel_id, role, created_at, accepted, hotel_config(name)')
    .eq('accepted', false)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((inv: any) => ({
    id: inv.id,
    email: inv.email,
    hotel_id: inv.hotel_id,
    hotel_name: inv.hotel_config?.name || inv.hotel_id,
    role: inv.role,
    created_at: inv.created_at,
    accepted: inv.accepted,
  }));
}

export async function revokeInvite(inviteId: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('dashboard_invites')
    .delete()
    .eq('id', inviteId);

  return { success: !error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hotel Groups
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHotelGroups(): Promise<HotelGroup[]> {
  const { data, error } = await supabase
    .from('hotel_groups')
    .select('id, name, slug, logo_url, created_at')
    .order('name');

  if (error || !data) return [];
  return data as HotelGroup[];
}

export async function createHotelGroup(
  name: string,
  slug: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { data, error } = await supabase
    .from('hotel_groups')
    .insert({ name, slug })
    .select('id')
    .single();

  return error
    ? { success: false, error: error.message }
    : { success: true, id: data.id };
}

export async function assignHotelToGroup(
  hotelId: string,
  groupId: string | null
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('hotel_config')
    .update({ group_id: groupId })
    .eq('id', hotelId);

  return { success: !error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Create a brand-new dashboard user
//
// Uses the service role key (VITE_SUPABASE_SERVICE_ROLE_KEY) to call
// admin.auth.admin.createUser() directly — no invite, no email, user is
// created and confirmed immediately.
//
// The admin shares credentials manually. On first login, the dashboard
// detects must_change_password: true in user_metadata and forces a password
// change before showing the main dashboard.
// ─────────────────────────────────────────────────────────────────────────────

function getAdminClient() {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY not set in .env');
  return createClient(
    'https://hnivuisqktlrusyqywaz.supabase.co',
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface CreateUserParams {
  email: string;
  fullName: string;
  password: string;
  globalRole: 'hotel_admin' | 'staff';
  hotelId?: string;
  hotelRole?: 'admin' | 'staff';
}

export async function createDashboardUser(
  params: CreateUserParams
): Promise<{ success: boolean; error?: string }> {
  const { email, fullName, password, globalRole, hotelId, hotelRole } = params;

  let adminClient;
  try {
    adminClient = getAdminClient();
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  // ── Try to create user directly via service role ──────────────────────────
  let userId: string;

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName.trim(),
      must_change_password: true,
    },
  });

  if (createError) {
    // User already exists in auth — find them and update instead of failing
    const alreadyExists =
      createError.message.toLowerCase().includes('already been registered') ||
      createError.message.toLowerCase().includes('already registered') ||
      createError.message.toLowerCase().includes('already exists');

    if (!alreadyExists) return { success: false, error: createError.message };

    // Look up existing user by email
    const { data: list } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const existing = list?.users?.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (!existing) return { success: false, error: 'User exists but could not be found. Try refreshing.' };

    userId = existing.id;

    // Update password + metadata on existing user
    await adminClient.auth.admin.updateUserById(userId, {
      password,
      user_metadata: {
        ...existing.user_metadata,
        full_name: fullName.trim(),
        must_change_password: true,
      },
    });
  } else {
    userId = created.user.id;
  }

  // ── Ensure dashboard_users row exists (trigger may not have fired) ─────────
  await supabase
    .from('dashboard_users')
    .upsert(
      { id: userId, email: email.trim(), full_name: fullName.trim(), role: globalRole },
      { onConflict: 'id' }
    );

  // ── Assign to hotel if specified ──────────────────────────────────────────
  if (hotelId) {
    await supabase
      .from('dashboard_user_hotels')
      .upsert(
        { user_id: userId, hotel_id: hotelId, role: hotelRole ?? 'admin' },
        { onConflict: 'user_id,hotel_id' }
      );
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a password-reset / "set your password" email to an existing user
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}?type=recovery`,
  });
  return error ? { success: false, error: error.message } : { success: true };
}
