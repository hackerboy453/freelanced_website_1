-- Fix RLS Policies to use is_admin() function instead of direct auth.users queries
-- This fixes the "permission denied for table users" error

-- ============================================
-- 1. Ensure is_admin() function exists and is properly configured
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- 2. Fix Orders RLS Policies
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

-- Admins can view all orders (using is_admin() function)
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.is_admin());

-- Admins can update orders (using is_admin() function)
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 3. Fix Order Items RLS Policies
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

-- Admins can view all order items (using is_admin() function)
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.is_admin());

-- ============================================
-- 4. Verify the function works
-- ============================================
-- Test the function (this should return true/false without errors)
SELECT public.is_admin() as is_current_user_admin;

-- ============================================
-- 5. Check current user's admin status
-- ============================================
-- This will show your current user's metadata
-- Note: This query might fail if you don't have direct access to auth.users
-- But the is_admin() function should work because it uses SECURITY DEFINER
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin_metadata
FROM auth.users
WHERE id = auth.uid();

