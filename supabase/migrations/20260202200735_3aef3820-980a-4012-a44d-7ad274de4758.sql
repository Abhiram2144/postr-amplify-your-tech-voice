-- Fix the handle_new_user function to have correct column name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
begin
  insert into public.users (id, email, full_name, avatar_url, auth_provider)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url', new.raw_app_meta_data->>'provider');
  return new;
end;
$function$;

DROP POLICY IF EXISTS "Allow insert for auth trigger" ON public.users;
DROP POLICY IF EXISTS "Allow insert from auth trigger" ON public.users;
DROP POLICY IF EXISTS "Auth system can insert users rows" ON public.users;
