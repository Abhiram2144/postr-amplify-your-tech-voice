-- Fix the handle_new_user function to have a fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    auth_provider
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.app_metadata->>'provider'
  );
  return new;
end;
$function$;

-- Drop the redundant and overly permissive INSERT policies on users table
DROP POLICY IF EXISTS "Allow insert for auth trigger" ON public.users;
DROP POLICY IF EXISTS "Allow insert from auth trigger" ON public.users;
DROP POLICY IF EXISTS "Auth system can insert users rows" ON public.users;

-- Create a single restrictive INSERT policy that only allows users to insert their own record
-- The auth trigger uses SECURITY DEFINER so it bypasses RLS anyway
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);