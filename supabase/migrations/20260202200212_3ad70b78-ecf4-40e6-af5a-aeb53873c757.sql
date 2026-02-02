-- Enable RLS on the users table (policies already exist)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the content_outputs table
ALTER TABLE public.content_outputs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_outputs
-- Users can only access content_outputs for their own projects

-- SELECT: Users can read content outputs for their own projects
CREATE POLICY "Users can read own content outputs"
ON public.content_outputs
FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- INSERT: Users can create content outputs for their own projects
CREATE POLICY "Users can insert own content outputs"
ON public.content_outputs
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- UPDATE: Users can update content outputs for their own projects
CREATE POLICY "Users can update own content outputs"
ON public.content_outputs
FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- DELETE: Users can delete content outputs for their own projects
CREATE POLICY "Users can delete own content outputs"
ON public.content_outputs
FOR DELETE
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);