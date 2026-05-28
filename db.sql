-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.content_outputs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  platform text,
  content_type text,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  original_input text,
  input_type text,
  analysis_score integer,
  analysis_feedback jsonb,
  improved_content text,
  rewrite_count integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  generation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  generation_source USER-DEFINED NOT NULL DEFAULT 'ai'::generation_source_type,
  rewrite_limit integer,
  last_rewritten_at timestamp with time zone,
  CONSTRAINT content_outputs_pkey PRIMARY KEY (id),
  CONSTRAINT content_outputs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.project_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  content_output_id uuid,
  CONSTRAINT project_notes_pkey PRIMARY KEY (id),
  CONSTRAINT project_notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_notes_content_output_id_fkey FOREIGN KEY (content_output_id) REFERENCES public.content_outputs(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text,
  input_type text,
  status text,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  goal text,
  platforms ARRAY DEFAULT '{}'::text[],
  archived boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text,
  units integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT usage_logs_pkey PRIMARY KEY (id),
  CONSTRAINT usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rating integer NOT NULL,
  category text DEFAULT 'general'::text,
  subject text,
  message text NOT NULL,
  page_context text,
  source text DEFAULT 'dashboard'::text,
  status text DEFAULT 'new'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT user_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
  CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_stripe_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_stripe_data_pkey PRIMARY KEY (id),
  CONSTRAINT user_stripe_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  auth_provider text,
  role text DEFAULT 'user'::text,
  status text DEFAULT 'active'::text,
  onboarding_completed boolean DEFAULT false,
  plan text DEFAULT 'free'::text,
  plan_started_at timestamp with time zone,
  plan_expires_at timestamp with time zone,
  monthly_generation_limit integer DEFAULT 10,
  monthly_video_limit integer DEFAULT 2,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  primary_goal text,
  experience_level text,
  platforms ARRAY DEFAULT '{}'::text[],
  generations_used_this_month integer NOT NULL DEFAULT 0,
  usage_reset_month integer NOT NULL DEFAULT EXTRACT(month FROM CURRENT_DATE),
  usage_reset_year integer NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);