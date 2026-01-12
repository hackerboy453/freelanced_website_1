-- ============================================
-- Cart Items Table Setup and RLS Policies
-- ============================================
-- This script creates the cart_items table and sets up Row Level Security
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create cart_items table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- 2. Enable Row Level Security
-- ============================================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Drop existing policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can add to their cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from their cart" ON public.cart_items;

-- ============================================
-- 4. Create RLS Policies
-- ============================================

-- Users can view their own cart items
CREATE POLICY "Users can view their own cart" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can add items to their own cart
CREATE POLICY "Users can add to their cart" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update their cart" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete items from their own cart
CREATE POLICY "Users can delete from their cart" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- 5. Create index for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- ============================================
-- 6. Create trigger to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_cart_items_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cart_items_updated_at();

-- ============================================
-- 7. Verification queries
-- ============================================
-- Check if table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cart_items'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'cart_items'
ORDER BY policyname;

-- ============================================
-- 8. Test query (uncomment to test)
-- ============================================
-- This should return your cart items when logged in
-- SELECT * FROM public.cart_items WHERE user_id = auth.uid();

