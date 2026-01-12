-- Fix RLS policies for admin access
-- This script fixes the admin policies to properly check for admin status

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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

-- Recreate Categories admin policy
CREATE POLICY "Admins can manage categories" ON public.categories 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Recreate Products admin policy (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage products" ON public.products 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Recreate Orders admin policies
CREATE POLICY "Admins can view all orders" ON public.orders 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON public.orders 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Recreate Order items admin policy
CREATE POLICY "Admins can view all order items" ON public.order_items 
FOR SELECT 
USING (public.is_admin());

-- Recreate Blogs admin policy
CREATE POLICY "Admins can manage blogs" ON public.blogs 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

