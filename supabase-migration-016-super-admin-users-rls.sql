-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 016 — Super Admin full access to dashboard_users
--
-- Problem: the only existing policy on dashboard_users is "self access" (FOR ALL
-- WHERE id = auth.uid()), which means super_admins can't read or manage other
-- users' rows via the anon key.  This makes the Admin Panel → Users tab only
-- return the current user's own row.
--
-- Solution: a SECURITY DEFINER helper function bypasses RLS when checking the
-- current user's role, then two policies grant super_admins full access.
--
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Helper function — bypasses RLS to check the calling user's role ────────
--    SECURITY DEFINER runs with the function owner's privileges (postgres),
--    so the inner SELECT is not subject to the "self access" RLS policy.
--    This avoids the recursive-policy problem.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.dashboard_users
    WHERE id  = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- Allow every authenticated user to call this function
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ── 2. Replace the existing "FOR ALL" self-access policy with two targeted ones
--    so it doesn't shadow the new super_admin policies in PostgreSQL's OR-merge
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the broad catch-all (we'll recreate it as a narrower SELECT + a separate
-- INSERT/UPDATE/DELETE so that the super_admin policy can apply alongside it)
DROP POLICY IF EXISTS "dashboard_users: self access" ON dashboard_users;

-- Self: read own row
DROP POLICY IF EXISTS "dashboard_users: self read" ON dashboard_users;
CREATE POLICY "dashboard_users: self read"
  ON dashboard_users FOR SELECT
  USING (id = auth.uid() OR is_super_admin());

-- Self: write own row (INSERT / UPDATE / DELETE)
DROP POLICY IF EXISTS "dashboard_users: self write" ON dashboard_users;
CREATE POLICY "dashboard_users: self write"
  ON dashboard_users FOR ALL
  USING (id = auth.uid());

-- ── 3. Super admin: full read + write on ALL rows ─────────────────────────────

DROP POLICY IF EXISTS "dashboard_users: super_admin manage all" ON dashboard_users;
CREATE POLICY "dashboard_users: super_admin manage all"
  ON dashboard_users FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── 4. dashboard_user_hotels: super_admin can manage all assignments ──────────

-- The existing policy only allows users to manage their OWN hotel links.
-- Super admin needs to assign / remove hotels for OTHER users.

DROP POLICY IF EXISTS "dashboard_user_hotels: super_admin manage all" ON dashboard_user_hotels;
CREATE POLICY "dashboard_user_hotels: super_admin manage all"
  ON dashboard_user_hotels FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification queries (run manually to confirm)
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT is_super_admin();   → should return TRUE when logged in as super_admin
-- SELECT COUNT(*) FROM dashboard_users;  → should return all rows for super_admin
-- ─────────────────────────────────────────────────────────────────────────────
