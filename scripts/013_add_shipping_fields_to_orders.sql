-- Add shipping_full_name and shipping_phone to orders table
-- This script adds missing shipping contact fields for better order tracking

DO $$ 
BEGIN
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
END $$;

-- Update existing orders with profile data if shipping fields are null
UPDATE public.orders o
SET 
  shipping_full_name = COALESCE(o.shipping_full_name, p.full_name),
  shipping_phone = COALESCE(o.shipping_phone, p.phone)
FROM public.profiles p
WHERE o.user_id = p.id
  AND (o.shipping_full_name IS NULL OR o.shipping_phone IS NULL);

