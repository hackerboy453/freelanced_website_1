-- Fix Products Public Access - Ensure all users can view active products
-- This script ensures that products created by admin are visible to all users (logged in or not)

-- ============================================
-- 1. Ensure is_admin() function exists
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      raw_user_meta_data->>'is_admin' = 'true' 
      OR raw_user_meta_data->>'is_admin' = 'TRUE'
      OR (raw_user_meta_data->'is_admin')::boolean = true
    )
  );
$$;

-- ============================================
-- 2. Drop all existing product policies to start fresh
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

-- ============================================
-- 3. Create public read policy for active products
-- ============================================
-- This allows ANYONE (authenticated or anonymous) to view active products
-- This is the most permissive policy and should allow all users to see active products
CREATE POLICY "Public can view active products" 
ON public.products 
FOR SELECT 
TO authenticated, anon
USING (is_active = true);

-- ============================================
-- 4. Create admin policy to view all products (including inactive)
-- ============================================
-- This allows admins to see all products regardless of active status
-- Note: This policy uses is_admin() function for cleaner code
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (public.is_admin() OR is_active = true);

-- ============================================
-- 5. Create admin policy to manage products (INSERT, UPDATE, DELETE)
-- ============================================
-- This allows admins to create, update, and delete products
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 6. Verify RLS is enabled
-- ============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. Ensure all existing products are active (if they should be visible)
-- ============================================
-- Uncomment the line below if you want to make all existing products active
-- UPDATE public.products SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- ============================================
-- 8. Verify policies are created
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY policyname;

