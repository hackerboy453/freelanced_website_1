-- Comprehensive Fix: Public Access for Products, Categories, and Blogs
-- This script ensures ALL users (logged in or not) can view products, categories, and blogs

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
-- 2. CATEGORIES - Drop all existing policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read policy for categories (ALLOW EVERYONE - authenticated and anonymous)
CREATE POLICY "Public can view categories" 
ON public.categories 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Admin manage policy for categories
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 3. PRODUCTS - Drop all existing policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read policy for active products (ALLOW EVERYONE - authenticated and anonymous)
CREATE POLICY "Public can view active products" 
ON public.products 
FOR SELECT 
TO authenticated, anon
USING (is_active = true);

-- Admin view all products (including inactive)
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (public.is_admin() OR is_active = true);

-- Admin manage policy for products
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 4. BLOGS - Drop all existing policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can view all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Public read policy for published blogs (ALLOW EVERYONE - authenticated and anonymous)
CREATE POLICY "Public can view published blogs" 
ON public.blogs 
FOR SELECT 
TO authenticated, anon
USING (is_published = true);

-- Admin view all blogs (including unpublished)
CREATE POLICY "Admins can view all blogs" 
ON public.blogs 
FOR SELECT 
TO authenticated
USING (public.is_admin() OR is_published = true);

-- Admin manage policy for blogs
CREATE POLICY "Admins can manage blogs" 
ON public.blogs 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 5. Verification - Check all policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'products', 'blogs')
ORDER BY tablename, policyname;

-- ============================================
-- 6. Test queries (run these to verify)
-- ============================================
-- Test as anonymous user (should return results)
-- SET ROLE anon;
-- SELECT COUNT(*) as category_count FROM public.categories;
-- SELECT COUNT(*) as product_count FROM public.products WHERE is_active = true;
-- SELECT COUNT(*) as blog_count FROM public.blogs WHERE is_published = true;
-- RESET ROLE;

