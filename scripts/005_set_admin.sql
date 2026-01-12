-- Set a user as admin by email
-- Replace 'indiedevadi@gmail.com' with your email address

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'indiedevadi@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE email = 'indiedevadi@gmail.com';

