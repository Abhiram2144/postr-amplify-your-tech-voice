-- Store immutable billing and subscription history for auditing and support.
CREATE TABLE public.billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'dodo',
  event_type text NOT NULL,
  event_id text,
  status text,
  customer_id text,
  subscription_id text,
  product_id text,
  amount numeric,
  currency text,
  email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX billing_events_user_id_created_at_idx ON public.billing_events (user_id, created_at DESC);
CREATE INDEX billing_events_subscription_id_idx ON public.billing_events (subscription_id);
CREATE INDEX billing_events_event_type_created_at_idx ON public.billing_events (event_type, created_at DESC);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read billing events"
ON public.billing_events
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert billing events"
ON public.billing_events
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update billing events"
ON public.billing_events
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));