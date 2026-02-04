-- Adds generation_id to group multiple platform outputs as a single "generation"

ALTER TABLE public.content_outputs
ADD COLUMN IF NOT EXISTS generation_id uuid;

-- Default ensures older code paths don't insert NULL (but will still be ungrouped)
ALTER TABLE public.content_outputs
ALTER COLUMN generation_id SET DEFAULT gen_random_uuid();

-- Backfill existing rows so they group as one-per-row (legacy behavior)
UPDATE public.content_outputs
SET generation_id = id
WHERE generation_id IS NULL;

-- Ensure every row has a generation_id
ALTER TABLE public.content_outputs
ALTER COLUMN generation_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_outputs_generation_id
  ON public.content_outputs(generation_id);

CREATE INDEX IF NOT EXISTS idx_content_outputs_project_generation
  ON public.content_outputs(project_id, generation_id);
