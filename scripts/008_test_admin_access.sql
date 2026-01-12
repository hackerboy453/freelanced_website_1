-- Test script to verify admin access and RLS policies
-- Run this to check if your admin user can insert into categories

-- First, check if the is_admin function exists and works
SELECT public.is_admin() as is_current_user_admin;

-- Check your current user's admin status
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin_metadata,
  raw_user_meta_data as full_metadata
FROM auth.users
WHERE id = auth.uid();

-- Test if you can insert into categories (this will show the actual error)
-- Replace 'Test Category' with your test category name
INSERT INTO public.categories (name, slug, description)
VALUES ('Test Category', 'test-category', 'Test description')
RETURNING *;

-- If the above works, delete the test category
-- DELETE FROM public.categories WHERE slug = 'test-category';

