-- Create table for sensitive Stripe payment data (admin-only access)
CREATE TABLE public.user_stripe_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stripe_data ENABLE ROW LEVEL SECURITY;

-- Only admins can read stripe data (PERMISSIVE for defense-in-depth)
CREATE POLICY "Admins can read stripe data"
ON public.user_stripe_data
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update stripe data
CREATE POLICY "Admins can update stripe data"
ON public.user_stripe_data
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can insert stripe data
CREATE POLICY "Admins can insert stripe data"
ON public.user_stripe_data
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete stripe data
CREATE POLICY "Admins can delete stripe data"
ON public.user_stripe_data
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing stripe data from users table
INSERT INTO public.user_stripe_data (user_id, stripe_customer_id, stripe_subscription_id)
SELECT id, stripe_customer_id, stripe_subscription_id
FROM public.users
WHERE stripe_customer_id IS NOT NULL OR stripe_subscription_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Remove sensitive stripe columns from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_subscription_id;