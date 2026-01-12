-- Add subcategories support to categories table
-- This allows categories to have parent categories (subcategories)

-- Add parent_id column to categories table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'categories' 
                 AND column_name = 'parent_id') THEN
    ALTER TABLE public.categories ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;
    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
  END IF;
END $$;

-- Update RLS policies to include subcategories
-- The existing policies should work, but let's make sure they're correct
-- Categories with parent_id are subcategories, categories without parent_id are main categories

