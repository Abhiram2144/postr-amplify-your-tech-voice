-- Enable RLS on users and content_outputs (tables already exist from base migration)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_outputs ENABLE ROW LEVEL SECURITY;

-- Content outputs RLS (these are new, not duplicated)
CREATE POLICY "Users can read own content outputs" ON public.content_outputs FOR SELECT
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own content outputs" ON public.content_outputs FOR INSERT
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own content outputs" ON public.content_outputs FOR UPDATE
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own content outputs" ON public.content_outputs FOR DELETE
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
