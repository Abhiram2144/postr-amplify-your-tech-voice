-- Add subscription_status to track actual state (active, cancelling, cancelled, expired, failed, on_hold, free)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_override_by_admin boolean DEFAULT false;

-- Backfill subscription_status from current plan data
UPDATE public.users
SET subscription_status = CASE
  WHEN plan IS NULL OR LOWER(plan) = 'free' THEN 'free'
  WHEN plan_expires_at IS NOT NULL AND plan_expires_at < NOW() THEN 'expired'
  ELSE 'active'
END;
