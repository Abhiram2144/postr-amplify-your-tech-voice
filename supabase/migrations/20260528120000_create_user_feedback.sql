CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category text NOT NULL DEFAULT 'general',
  subject text,
  message text NOT NULL,
  page_context text,
  source text NOT NULL DEFAULT 'dashboard',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_feedback_user_id_created_at_idx ON public.user_feedback (user_id, created_at DESC);
CREATE INDEX user_feedback_category_created_at_idx ON public.user_feedback (category, created_at DESC);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
ON public.user_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
ON public.user_feedback
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
ON public.user_feedback
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all feedback"
ON public.user_feedback
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all feedback"
ON public.user_feedback
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));