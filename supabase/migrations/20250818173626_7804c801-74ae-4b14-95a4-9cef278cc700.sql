-- Create demo user Laurence Mauny in auth.users
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'laurence.mauny@demo.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"display_name": "Laurence Mauny", "role": "tuteur"}',
  false,
  '',
  '',
  ''
);

-- Create profile for Laurence
INSERT INTO public.profiles (
  id,
  user_id,
  display_name,
  role,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'Laurence Mauny',
  'tuteur',
  now(),
  now()
FROM auth.users u 
WHERE u.email = 'laurence.mauny@demo.com';