-- Seed initial categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
  ('Electronics', 'electronics', 'Smartphones, laptops, gadgets and more', '/placeholder.svg?height=200&width=200'),
  ('Fashion', 'fashion', 'Clothing, shoes, and accessories', '/placeholder.svg?height=200&width=200'),
  ('Home & Kitchen', 'home-kitchen', 'Furniture, appliances, and decor', '/placeholder.svg?height=200&width=200'),
  ('Books', 'books', 'Fiction, non-fiction, and educational books', '/placeholder.svg?height=200&width=200'),
  ('Sports', 'sports', 'Sports equipment and fitness gear', '/placeholder.svg?height=200&width=200'),
  ('Beauty', 'beauty', 'Skincare, makeup, and personal care', '/placeholder.svg?height=200&width=200')
ON CONFLICT (slug) DO NOTHING;
