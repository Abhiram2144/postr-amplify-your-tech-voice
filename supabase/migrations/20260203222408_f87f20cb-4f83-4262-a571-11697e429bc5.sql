-- Fix users table RLS policies
-- The current policies are all RESTRICTIVE which means no access is granted
-- Change user self-access policies to PERMISSIVE to properly grant access
-- Keep admin policies as RESTRICTIVE for defense-in-depth

-- Drop existing user self-access policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Recreate as PERMISSIVE (default) policies for proper access granting
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also fix the same issue on other tables that may have RESTRICTIVE-only policies

-- Projects table
DROP POLICY IF EXISTS "Projects: users can read own" ON public.projects;
DROP POLICY IF EXISTS "Projects: users can insert own" ON public.projects;
DROP POLICY IF EXISTS "Projects: users can update own" ON public.projects;
DROP POLICY IF EXISTS "Projects: users can delete own" ON public.projects;

CREATE POLICY "Projects: users can read own" 
ON public.projects 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Projects: users can insert own" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Projects: users can update own" 
ON public.projects 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Projects: users can delete own" 
ON public.projects 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- User roles table
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users can read own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Usage logs table
DROP POLICY IF EXISTS "Usage logs: users can read own" ON public.usage_logs;
DROP POLICY IF EXISTS "Usage logs: users can insert own" ON public.usage_logs;

CREATE POLICY "Usage logs: users can read own" 
ON public.usage_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usage logs: users can insert own" 
ON public.usage_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Content outputs table
DROP POLICY IF EXISTS "Users can read own content outputs" ON public.content_outputs;
DROP POLICY IF EXISTS "Users can insert own content outputs" ON public.content_outputs;
DROP POLICY IF EXISTS "Users can update own content outputs" ON public.content_outputs;
DROP POLICY IF EXISTS "Users can delete own content outputs" ON public.content_outputs;

CREATE POLICY "Users can read own content outputs" 
ON public.content_outputs 
FOR SELECT 
TO authenticated
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own content outputs" 
ON public.content_outputs 
FOR INSERT 
TO authenticated
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own content outputs" 
ON public.content_outputs 
FOR UPDATE 
TO authenticated
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own content outputs" 
ON public.content_outputs 
FOR DELETE 
TO authenticated
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));