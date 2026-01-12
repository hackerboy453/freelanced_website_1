-- Add discount percentage fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_21_50 DECIMAL(5, 2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS discount_51_plus DECIMAL(5, 2) DEFAULT 20.00;

-- Add comment to explain the discount fields
COMMENT ON COLUMN public.products.discount_21_50 IS 'Discount percentage for 21-50 units (default 10%)';
COMMENT ON COLUMN public.products.discount_51_plus IS 'Discount percentage for 51+ units (default 20%)';

