-- Check current auth_provider value for your account
SELECT id, email, auth_provider 
FROM public.users 
WHERE email = 'YOUR_EMAIL_HERE';

-- Update auth_provider to 'google' for accounts that signed up via Google OAuth
-- This updates users where the auth.users table shows they used Google
UPDATE public.users u
SET auth_provider = 'google'
FROM auth.users au
WHERE u.id = au.id
  AND au.raw_app_meta_data->>'provider' = 'google'
  AND (u.auth_provider IS NULL OR u.auth_provider != 'google');

-- Verify the update
SELECT id, email, auth_provider 
FROM public.users 
WHERE auth_provider = 'google';
