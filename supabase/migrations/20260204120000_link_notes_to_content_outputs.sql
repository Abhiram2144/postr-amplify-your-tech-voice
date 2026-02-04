-- Link project notes to generated content outputs
-- Adds an optional reference from project_notes -> content_outputs

ALTER TABLE public.project_notes
ADD COLUMN IF NOT EXISTS content_output_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'project_notes_content_output_id_fkey'
  ) THEN
    ALTER TABLE public.project_notes
    ADD CONSTRAINT project_notes_content_output_id_fkey
    FOREIGN KEY (content_output_id)
    REFERENCES public.content_outputs(id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_notes_content_output_id
  ON public.project_notes(content_output_id);
