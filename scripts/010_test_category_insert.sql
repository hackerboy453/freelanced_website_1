-- Test script to diagnose category insert issues
-- Run this in Supabase SQL Editor to check if you can insert categories

-- 1. Check if you're logged in and have admin status
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin_metadata,
  CASE 
    WHEN raw_user_meta_data->>'is_admin' = 'true' THEN 'YES - You are admin'
    WHEN raw_user_meta_data->>'is_admin' = 'TRUE' THEN 'YES - You are admin'
    WHEN (raw_user_meta_data->'is_admin')::boolean = true THEN 'YES - You are admin'
    ELSE 'NO - You are NOT admin'
  END as admin_status
FROM auth.users
WHERE id = auth.uid();

-- 2. Check if is_admin() function exists and works
SELECT 
  public.is_admin() as is_admin_function_result,
  CASE 
    WHEN public.is_admin() = true THEN 'Function returns TRUE - You can insert'
    ELSE 'Function returns FALSE - You CANNOT insert'
  END as can_insert;

-- 3. Check if categories table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'categories'
ORDER BY ordinal_position;

-- 4. Check RLS policies on categories table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'categories';

-- 5. Try to insert a test category (this will show the actual error if it fails)
-- Replace 'Test Category' with your test name
DO $$
DECLARE
  test_slug TEXT := 'test-category-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  INSERT INTO public.categories (name, slug, description)
  VALUES ('Test Category', test_slug, 'Test description')
  RETURNING id, name, slug;
  
  RAISE NOTICE 'SUCCESS: Category inserted successfully!';
  
  -- Clean up test category
  DELETE FROM public.categories WHERE slug = test_slug;
  RAISE NOTICE 'Test category cleaned up';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RAISE NOTICE 'Error Code: %', SQLSTATE;
END $$;

