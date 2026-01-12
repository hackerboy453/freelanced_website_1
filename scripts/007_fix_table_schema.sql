-- Fix table schema to match the application code
-- This script adds missing columns to your existing tables

-- Fix Categories table
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add slug column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'categories' 
                 AND column_name = 'slug') THEN
    ALTER TABLE public.categories ADD COLUMN slug TEXT;
    -- Generate slugs for existing categories
    UPDATE public.categories 
    SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE slug IS NULL;
    -- Make slug NOT NULL and UNIQUE after populating
    ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;
    ALTER TABLE public.categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'categories' 
                 AND column_name = 'description') THEN
    ALTER TABLE public.categories ADD COLUMN description TEXT;
  END IF;

  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'categories' 
                 AND column_name = 'image_url') THEN
    ALTER TABLE public.categories ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Fix Products table
DO $$ 
BEGIN
  -- Rename 'name' to 'title' if 'title' doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'products' 
             AND column_name = 'name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'products' 
                     AND column_name = 'title') THEN
    ALTER TABLE public.products RENAME COLUMN name TO title;
  END IF;

  -- Add images column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'images') THEN
    ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;

  -- Add stock column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'stock') THEN
    ALTER TABLE public.products ADD COLUMN stock INTEGER DEFAULT 0;
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'is_active') THEN
    ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Change price to DECIMAL(10, 2) if it's not already
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'products' 
             AND column_name = 'price'
             AND data_type != 'numeric') THEN
    ALTER TABLE public.products ALTER COLUMN price TYPE DECIMAL(10, 2);
  END IF;
END $$;

-- Fix Orders table
DO $$ 
BEGIN
  -- Add missing columns for orders if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'order_number') THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT;
    -- Generate order numbers for existing orders
    UPDATE public.orders 
    SET order_number = 'ORD-' || LPAD(id::text, 8, '0')
    WHERE order_number IS NULL;
    ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;
    ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'subtotal') THEN
    ALTER TABLE public.orders ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'tax') THEN
    ALTER TABLE public.orders ADD COLUMN tax DECIMAL(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'total') THEN
    ALTER TABLE public.orders ADD COLUMN total DECIMAL(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'shipping_address') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_address TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'shipping_city') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_city TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'shipping_state') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_state TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'shipping_pincode') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_pincode TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'payment_method') THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT DEFAULT 'cod';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Fix Order Items table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'order_items' 
                 AND column_name = 'product_title') THEN
    ALTER TABLE public.order_items ADD COLUMN product_title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'order_items' 
                 AND column_name = 'product_price') THEN
    ALTER TABLE public.order_items ADD COLUMN product_price DECIMAL(10, 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'order_items' 
                 AND column_name = 'created_at') THEN
    ALTER TABLE public.order_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Fix Blogs table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'slug') THEN
    ALTER TABLE public.blogs ADD COLUMN slug TEXT;
    -- Generate slugs for existing blogs
    UPDATE public.blogs 
    SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE slug IS NULL;
    ALTER TABLE public.blogs ALTER COLUMN slug SET NOT NULL;
    ALTER TABLE public.blogs ADD CONSTRAINT blogs_slug_unique UNIQUE (slug);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'excerpt') THEN
    ALTER TABLE public.blogs ADD COLUMN excerpt TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'image_url') THEN
    ALTER TABLE public.blogs ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'author_name') THEN
    ALTER TABLE public.blogs ADD COLUMN author_name TEXT DEFAULT 'Admin';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'is_published') THEN
    ALTER TABLE public.blogs ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE public.blogs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Verify the changes
SELECT 
  'Categories' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'categories'
ORDER BY ordinal_position;

SELECT 
  'Products' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

