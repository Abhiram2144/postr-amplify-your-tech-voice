-- Add admin RLS policies to enforce server-side authorization
-- These PERMISSIVE policies allow admins to access all records
-- The existing RESTRICTIVE user-scoped policies remain for regular users

-- ============================================
-- USERS TABLE - Admin policies
-- ============================================

-- Allow admins to read all users
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all users (for plan changes, status updates)
CREATE POLICY "Admins can update all users"
ON public.users
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- USAGE_LOGS TABLE - Admin read policy
-- ============================================

-- Allow admins to read all usage logs (for analytics)
CREATE POLICY "Admins can read all usage logs"
ON public.usage_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PROJECTS TABLE - Admin policies
-- ============================================

-- Allow admins to read all projects (for oversight)
CREATE POLICY "Admins can read all projects"
ON public.projects
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- CONTENT_OUTPUTS TABLE - Admin policies
-- ============================================

-- Allow admins to read all content outputs (for oversight)
CREATE POLICY "Admins can read all content outputs"
ON public.content_outputs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));