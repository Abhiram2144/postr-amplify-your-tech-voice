-- Extend projects table with new fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS goal text,
ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create trigger to update updated_at on projects
CREATE OR REPLACE FUNCTION public.update_projects_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_projects_updated_at();

-- Extend content_outputs table with new fields for analysis and rewrites
ALTER TABLE public.content_outputs 
ADD COLUMN IF NOT EXISTS original_input text,
ADD COLUMN IF NOT EXISTS input_type text,
ADD COLUMN IF NOT EXISTS analysis_score integer,
ADD COLUMN IF NOT EXISTS analysis_feedback jsonb,
ADD COLUMN IF NOT EXISTS improved_content text,
ADD COLUMN IF NOT EXISTS rewrite_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create trigger to update updated_at on content_outputs
CREATE OR REPLACE FUNCTION public.update_content_outputs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_content_outputs_updated_at
BEFORE UPDATE ON public.content_outputs
FOR EACH ROW
EXECUTE FUNCTION public.update_content_outputs_updated_at();

-- Create notes table
CREATE TABLE public.project_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notes
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for notes (access through project ownership)
CREATE POLICY "Users can read own project notes"
ON public.project_notes FOR SELECT
USING (project_id IN (
  SELECT id FROM public.projects WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert own project notes"
ON public.project_notes FOR INSERT
WITH CHECK (project_id IN (
  SELECT id FROM public.projects WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update own project notes"
ON public.project_notes FOR UPDATE
USING (project_id IN (
  SELECT id FROM public.projects WHERE user_id = auth.uid()
))
WITH CHECK (project_id IN (
  SELECT id FROM public.projects WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete own project notes"
ON public.project_notes FOR DELETE
USING (project_id IN (
  SELECT id FROM public.projects WHERE user_id = auth.uid()
));

-- Admin policies for notes
CREATE POLICY "Admins can read all project notes"
ON public.project_notes FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at on notes
CREATE TRIGGER update_project_notes_updated_at
BEFORE UPDATE ON public.project_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_content_outputs_updated_at();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON public.projects(archived);
CREATE INDEX IF NOT EXISTS idx_content_outputs_project_id ON public.content_outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON public.project_notes(project_id);