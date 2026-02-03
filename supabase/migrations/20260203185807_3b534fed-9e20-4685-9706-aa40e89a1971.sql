-- Add explicit policies for UPDATE and DELETE on usage_logs
-- Only admins should be able to modify or delete usage logs for corrections

-- Allow admins to update usage logs (for corrections)
CREATE POLICY "Usage logs: admins can update"
ON public.usage_logs
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete usage logs (for corrections)
CREATE POLICY "Usage logs: admins can delete"
ON public.usage_logs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));