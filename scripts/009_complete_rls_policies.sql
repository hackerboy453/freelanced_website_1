-- Complete RLS Policies for Admin E-commerce System
-- This script sets up all Row Level Security policies for the admin panel

-- ============================================
-- 1. Create helper function to check admin status
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
-- 2. Categories Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- Admins can manage categories (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 3. Products Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
TO authenticated, anon 
USING (is_active = true);

-- Admins can view all products (including inactive)
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
USING (public.is_admin() OR is_active = true);

-- Admins can manage products (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 4. Orders Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.is_admin());

-- Admins can update orders
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 5. Order Items Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Users can view their own order items
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Users can insert order items for their own orders
CREATE POLICY "Users can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.is_admin());

-- ============================================
-- 6. Cart Items Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can add to their cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from their cart" ON public.cart_items;

-- Users can view their own cart
CREATE POLICY "Users can view their own cart" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can add to their cart
CREATE POLICY "Users can add to their cart" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their cart
CREATE POLICY "Users can update their cart" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete from their cart
CREATE POLICY "Users can delete from their cart" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 7. Blogs Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;

-- Anyone can view published blogs
CREATE POLICY "Anyone can view published blogs" 
ON public.blogs 
FOR SELECT 
TO authenticated, anon 
USING (is_published = true);

-- Admins can view all blogs (including unpublished)
CREATE POLICY "Admins can view all blogs" 
ON public.blogs 
FOR SELECT 
USING (public.is_admin() OR is_published = true);

-- Admins can manage blogs (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage blogs" 
ON public.blogs 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 8. Profiles Policies (if needed)
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ============================================
-- Verification
-- ============================================
-- Check that all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

