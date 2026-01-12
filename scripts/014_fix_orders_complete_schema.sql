-- Complete fix for orders and order_items tables
-- This script ensures all required columns exist and RLS policies are correct

-- ============================================
-- 1. Fix Orders Table - Add all missing columns
-- ============================================
DO $$ 
BEGIN
  -- Add order_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT;
    -- Generate order numbers for existing orders
    UPDATE public.orders 
    SET order_number = 'ORD-' || LPAD(REPLACE(id::text, '-', ''), 12, '0')
    WHERE order_number IS NULL;
    ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_order_number_unique'
    ) THEN
      ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
    END IF;
  END IF;

  -- Add subtotal if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0 NOT NULL;
  END IF;

  -- Add tax if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'tax'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN tax DECIMAL(10, 2) DEFAULT 0 NOT NULL;
  END IF;

  -- Add total if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'total'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN total DECIMAL(10, 2) DEFAULT 0 NOT NULL;
  END IF;

  -- Add shipping_address if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_address TEXT;
  END IF;

  -- Add shipping_city if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'shipping_city'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_city TEXT;
  END IF;

  -- Add shipping_state if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'shipping_state'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_state TEXT;
  END IF;

  -- Add shipping_pincode if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'shipping_pincode'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_pincode TEXT;
  END IF;

  -- Add shipping_full_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'shipping_full_name'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_full_name TEXT;
  END IF;

  -- Add shipping_phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'shipping_phone'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_phone TEXT;
  END IF;

  -- Add payment_method if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT DEFAULT 'cod';
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- 2. Fix Order Items Table - Add all missing columns
-- ============================================
DO $$ 
BEGIN
  -- Add product_title if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'product_title'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN product_title TEXT;
    -- Update existing rows with product title from products table
    UPDATE public.order_items oi
    SET product_title = p.title
    FROM public.products p
    WHERE oi.product_id = p.id AND oi.product_title IS NULL;
    -- Make it NOT NULL after populating
    ALTER TABLE public.order_items ALTER COLUMN product_title SET NOT NULL;
  END IF;

  -- Add product_price if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'product_price'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN product_price DECIMAL(10, 2);
    -- Update existing rows with product price from products table
    UPDATE public.order_items oi
    SET product_price = p.price
    FROM public.products p
    WHERE oi.product_id = p.id AND oi.product_price IS NULL;
    -- Make it NOT NULL after populating
    ALTER TABLE public.order_items ALTER COLUMN product_price SET NOT NULL;
  END IF;

  -- Add quantity if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'quantity'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN quantity INTEGER DEFAULT 1 NOT NULL;
  END IF;

  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- 3. Fix RLS Policies for Orders
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
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      raw_user_meta_data->>'is_admin' = 'true' 
      OR raw_user_meta_data->>'is_admin' = 'TRUE'
      OR (raw_user_meta_data->'is_admin')::boolean = true
    )
  )
);

-- Admins can update orders
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      raw_user_meta_data->>'is_admin' = 'true' 
      OR raw_user_meta_data->>'is_admin' = 'TRUE'
      OR (raw_user_meta_data->'is_admin')::boolean = true
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      raw_user_meta_data->>'is_admin' = 'true' 
      OR raw_user_meta_data->>'is_admin' = 'TRUE'
      OR (raw_user_meta_data->'is_admin')::boolean = true
    )
  )
);

-- ============================================
-- 4. Fix RLS Policies for Order Items
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
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      raw_user_meta_data->>'is_admin' = 'true' 
      OR raw_user_meta_data->>'is_admin' = 'TRUE'
      OR (raw_user_meta_data->'is_admin')::boolean = true
    )
  )
);

-- ============================================
-- 5. Refresh schema cache (PostgREST)
-- ============================================
-- Note: You may need to restart your Supabase instance or wait for cache refresh
-- This is handled automatically by Supabase, but you can also manually refresh

-- ============================================
-- 6. Verify the schema
-- ============================================
SELECT 
  'orders' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'orders'
ORDER BY ordinal_position;

SELECT 
  'order_items' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'order_items'
ORDER BY ordinal_position;

