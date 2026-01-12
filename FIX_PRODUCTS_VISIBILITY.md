# Fix Products Visibility Issue

## Problem
Products created by admin are not visible to other users or non-logged-in users.

## Solution
This is a Row Level Security (RLS) policy issue in Supabase. Follow these steps to fix it:

## Step 1: Run the Fix Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `scripts/011_fix_products_public_access.sql`
4. Click **Run**

This script will:
- ✅ Create/update the `is_admin()` helper function
- ✅ Drop conflicting policies
- ✅ Create proper public read policy for active products
- ✅ Create admin policies for managing products
- ✅ Ensure RLS is enabled

## Step 2: Verify Products Are Active

After running the script, check if your products have `is_active = true`:

1. Go to **Supabase Dashboard** → **Table Editor** → `products`
2. Check the `is_active` column for your products
3. If any products have `is_active = false` or `NULL`, update them:
   ```sql
   UPDATE public.products SET is_active = true WHERE is_active IS NULL OR is_active = false;
   ```

## Step 3: Test the Fix

1. **As a non-logged-in user:**
   - Visit `/products` page
   - You should see all active products

2. **As a logged-in user:**
   - Visit `/products` page
   - You should see all active products

3. **As an admin:**
   - Visit `/admin/products` page
   - You should see ALL products (including inactive ones)

## How It Works

The fix creates three RLS policies:

1. **"Public can view active products"**
   - Allows ANYONE (authenticated or anonymous) to view products where `is_active = true`
   - This is the main policy that makes products visible to everyone

2. **"Admins can view all products"**
   - Allows admins to see all products (including inactive ones)
   - Uses the `is_admin()` function to check admin status

3. **"Admins can manage products"**
   - Allows admins to create, update, and delete products
   - Only authenticated admin users can perform these actions

## Troubleshooting

### Products still not visible?

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'products';
   ```
   Should return `rowsecurity = true`

2. **Check policies exist:**
   ```sql
   SELECT policyname, cmd, roles 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'products';
   ```
   Should show at least 3 policies

3. **Check product status:**
   ```sql
   SELECT id, title, is_active 
   FROM public.products 
   LIMIT 10;
   ```
   Products should have `is_active = true` to be visible

4. **Test as anonymous user:**
   ```sql
   SET ROLE anon;
   SELECT COUNT(*) FROM public.products WHERE is_active = true;
   RESET ROLE;
   ```

### Still having issues?

- Make sure you've restarted your Next.js dev server after making changes
- Clear your browser cache
- Check browser console for any Supabase errors
- Verify your Supabase project URL and keys are correct in `.env.local`

## Important Notes

- ✅ Products must have `is_active = true` to be visible to public
- ✅ The product form defaults to `is_active = true` when creating new products
- ✅ Admins can see all products regardless of active status
- ✅ Only admins can create, update, or delete products

