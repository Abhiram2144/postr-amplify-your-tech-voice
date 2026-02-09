-- =============================================
-- Create base tables that were created via dashboard
-- but are missing from migrations
-- =============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  auth_provider text,
  role text DEFAULT 'user',
  status text DEFAULT 'active',
  plan text DEFAULT 'free',
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  onboarding_completed boolean DEFAULT false,
  primary_goal text,
  experience_level text,
  platforms text[] DEFAULT '{}',
  monthly_generation_limit integer DEFAULT 10,
  monthly_video_limit integer DEFAULT 2,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  title text,
  status text,
  input_type text,
  created_at timestamptz DEFAULT now()
);

-- 3. Content outputs table
CREATE TABLE IF NOT EXISTS public.content_outputs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  content text,
  content_type text,
  platform text,
  created_at timestamptz DEFAULT now()
);

-- 4. Usage logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  action text,
  units integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on projects and usage_logs
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Basic user-scoped RLS for projects
CREATE POLICY "Projects: users can read own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Projects: users can insert own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Projects: users can update own" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Projects: users can delete own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Basic user-scoped RLS for usage_logs
CREATE POLICY "Usage logs: users can read own" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usage logs: users can insert own" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Basic user-scoped RLS for users
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auth trigger to create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.users (id, email, full_name, avatar_url, auth_provider)
  values (
    new.id, new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  );
  return new;
end;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
