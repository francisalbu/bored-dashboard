import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OperatorProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'super_admin' | 'hotel_admin' | 'staff';
}

export interface AccessibleHotel {
  id: string;           // hotel_config.id  e.g. "vila-gale-lagos"
  name: string;
  location: string;
  logo_url: string | null;
  group_id: string | null;
  group_name: string | null;
  operator_role: 'owner' | 'admin' | 'staff';
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: OperatorProfile | null;
  hotels: AccessibleHotel[];
  activeHotelId: string | null;
  loading: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setActiveHotelId: (id: string) => void;
}

export type AuthContextValue = AuthState & AuthActions;

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<OperatorProfile | null> {
  const { data, error } = await supabase
    .from('dashboard_users')
    .select('id, email, full_name, avatar_url, role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Auth] fetchProfile error', error.message);
    return null;
  }
  return data as OperatorProfile;
}

async function fetchAccessibleHotels(userId: string, role: string): Promise<AccessibleHotel[]> {
  // super_admin sees all hotels (with group names)
  if (role === 'super_admin') {
    const { data, error } = await supabase
      .from('hotel_config')
      .select(`
        id, name, location, logo_url, group_id,
        hotel_groups ( name )
      `)
      .order('name');

    if (error) {
      console.error('[Auth] fetchAccessibleHotels (super_admin) error:', error.message, error);
      return [];
    }
    return (data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      location: h.location || '',
      logo_url: h.logo_url || null,
      group_id: h.group_id || null,
      group_name: h.hotel_groups?.name || null,
      operator_role: 'owner' as const,
    }));
  }

  // regular hotel_admin / staff → only their assigned hotels
  const { data, error } = await supabase
    .from('dashboard_user_hotels')
    .select(`
      role,
      hotel_config (
        id, name, location, logo_url, group_id,
        hotel_groups ( name )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('[Auth] fetchAccessibleHotels error:', error.message, error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.hotel_config.id,
    name: row.hotel_config.name,
    location: row.hotel_config.location || '',
    logo_url: row.hotel_config.logo_url || null,
    group_id: row.hotel_config.group_id || null,
    group_name: row.hotel_config.hotel_groups?.name || null,
    operator_role: row.role,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [hotels, setHotels] = useState<AccessibleHotel[]>([]);
  const [activeHotelId, setActiveHotelIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Ref (not state) so it's never stale inside the onAuthStateChange closure
  const initialSessionLoaded = useRef(false);

  const loadUserData = useCallback(async (currentUser: User, restoreFromStorage: boolean) => {
    const prof = await fetchProfile(currentUser.id);
    if (!prof) {
      setLoading(false);
      return;
    }
    setProfile(prof);

    const hotelList = await fetchAccessibleHotels(currentUser.id, prof.role);
    setHotels(hotelList);

    if (restoreFromStorage) {
      // Page refresh → restore last active hotel silently
      const stored = localStorage.getItem('activeHotelId');
      const valid = hotelList.find(h => h.id === stored);
      if (valid) {
        setActiveHotelIdState(valid.id);
      } else if (hotelList.length === 1) {
        setActiveHotelIdState(hotelList[0].id);
      }
      // else: leave null → show selector
    } else {
      // Fresh login → always clear and show selector (unless only 1 hotel)
      localStorage.removeItem('activeHotelId');
      if (hotelList.length === 1) {
        setActiveHotelIdState(hotelList[0].id);
      }
      // else: leave null → show hotel selector
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        initialSessionLoaded.current = true;
        loadUserData(s.user, true); // page refresh → restore last hotel
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        // SIGNED_IN fires on both fresh login AND page refresh.
        // We use the ref to distinguish: if initial session is already loaded,
        // this is a fresh login → don't restore hotel from storage.
        const restoreFromStorage = initialSessionLoaded.current && event !== 'SIGNED_IN';
        if (!initialSessionLoaded.current) {
          initialSessionLoaded.current = true;
        }
        loadUserData(s.user, restoreFromStorage);
      } else {
        setProfile(null);
        setHotels([]);
        setActiveHotelIdState(null);
        initialSessionLoaded.current = false;
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    localStorage.removeItem('activeHotelId');
    await supabase.auth.signOut();
  };

  const setActiveHotelId = (id: string) => {
    localStorage.setItem('activeHotelId', id);
    setActiveHotelIdState(id);
  };

  const value: AuthContextValue = {
    session,
    user,
    profile,
    hotels,
    activeHotelId,
    loading,
    signIn,
    signOut,
    setActiveHotelId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
