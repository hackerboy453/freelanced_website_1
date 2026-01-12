# Fix Public Access for Products, Categories, and Blogs

## Problem
Non-logged-in users and different users cannot see products, categories, and blogs.

## Solution
Run the comprehensive fix script that ensures all tables are publicly accessible for reading.

## Step 1: Run the Fix Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the **ENTIRE** contents of `scripts/012_fix_public_access_all_tables.sql`
4. Click **Run**

This script will:
- ✅ Create/update the `is_admin()` helper function
- ✅ Drop ALL conflicting policies for categories, products, and blogs
- ✅ Create public read policies using `TO public` (most permissive)
- ✅ Create admin policies for managing content
- ✅ Verify RLS is enabled
- ✅ Show verification queries

## Step 2: Verify the Fix

After running the script, test access:

### Test 1: Check Policies Exist
Run this query in Supabase SQL Editor:
```sql
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'products', 'blogs')
ORDER BY tablename, policyname;
```

You should see:
- **categories**: "Public can view categories" (SELECT, roles: authenticated, anon)
- **products**: "Public can view active products" (SELECT, roles: authenticated, anon)
- **blogs**: "Public can view published blogs" (SELECT, roles: authenticated, anon)

### Test 2: Test as Anonymous User
Run this query to simulate anonymous access:
```sql
SET ROLE anon;
SELECT COUNT(*) as category_count FROM public.categories;
SELECT COUNT(*) as product_count FROM public.products WHERE is_active = true;
SELECT COUNT(*) as blog_count FROM public.blogs WHERE is_published = true;
RESET ROLE;
```

All queries should return counts > 0 if you have data.

### Test 3: Test in Browser
1. **Open an incognito/private window** (to ensure you're not logged in)
2. Visit:
   - `/products` - Should show all active products
   - `/categories` - Should show all categories
   - `/blogs` - Should show all published blogs

## Step 3: Verify Data Status

Make sure your data is in the correct state:

### Products
```sql
-- Check product status
SELECT id, title, is_active FROM public.products LIMIT 10;

-- If products are inactive, activate them:
UPDATE public.products SET is_active = true WHERE is_active = false OR is_active IS NULL;
```

### Blogs
```sql
-- Check blog status
SELECT id, title, is_published FROM public.blogs LIMIT 10;

-- If blogs are unpublished, publish them:
UPDATE public.blogs SET is_published = true WHERE is_published = false OR is_published IS NULL;
```

## Key Changes

The fix uses `TO authenticated, anon` which allows:
- `authenticated` = Logged-in users
- `anon` = Anonymous (non-logged-in) users

This ensures both logged-in and non-logged-in users can access the content.

## Troubleshooting

### Still can't see data?

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('categories', 'products', 'blogs');
   ```
   All should show `rowsecurity = true`

2. **Check policies are applied:**
   ```sql
   SELECT policyname, cmd, roles 
   FROM pg_policies 
   WHERE schemaname = 'public' 
     AND tablename IN ('categories', 'products', 'blogs');
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or use incognito/private window

4. **Restart Next.js server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

5. **Check Supabase connection:**
   - Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check browser console for Supabase errors

### Products not showing?

- Ensure products have `is_active = true`
- Check the product form defaults to `is_active = true` when creating

### Blogs not showing?

- Ensure blogs have `is_published = true`
- Check the blog form defaults to `is_published = true` when creating

### Categories not showing?

- Categories should always be visible (no status field)
- If still not showing, there might be no categories in the database

## Important Notes

- ✅ The fix uses `TO authenticated, anon` which allows both logged-in and anonymous users
- ✅ Products must have `is_active = true` to be visible
- ✅ Blogs must have `is_published = true` to be visible
- ✅ Categories are always visible (no restrictions)
- ✅ Admins can see all content regardless of status
- ✅ Only admins can create, update, or delete content

## After Fixing

Once the script runs successfully:
1. ✅ All users (logged in or not) can view products, categories, and blogs
2. ✅ Products must be active to be visible
3. ✅ Blogs must be published to be visible
4. ✅ Admins can manage all content
5. ✅ Regular users can only read public content

