-- Add medium_link column to blogs table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'blogs' 
                 AND column_name = 'medium_link') THEN
    ALTER TABLE public.blogs ADD COLUMN medium_link TEXT;
  END IF;
END $$;

