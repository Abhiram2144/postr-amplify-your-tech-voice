-- Fix security issue: Convert users table RLS policies to PERMISSIVE type
-- This provides defense-in-depth by ensuring proper access control

-- ============================================
-- DROP existing RESTRICTIVE policies on users table
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- ============================================
-- CREATE PERMISSIVE policies for users table
-- ============================================

-- Users can read their own profile (PERMISSIVE)
CREATE POLICY "Users can read own profile"
ON public.users
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can read all users (PERMISSIVE)
CREATE POLICY "Admins can read all users"
ON public.users
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert their own profile (PERMISSIVE)
CREATE POLICY "Users can insert own profile"
ON public.users
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile (PERMISSIVE)
CREATE POLICY "Users can update own profile"
ON public.users
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update all users (PERMISSIVE)
CREATE POLICY "Admins can update all users"
ON public.users
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));