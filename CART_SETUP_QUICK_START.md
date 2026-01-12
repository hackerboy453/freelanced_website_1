# Cart Setup - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Run SQL Query in Supabase

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `scripts/011_setup_cart_items.sql`
3. Paste and click **Run**

**OR** copy this query directly:

```sql
-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can add to their cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from their cart" ON public.cart_items;

-- Create RLS Policies
CREATE POLICY "Users can view their own cart" 
ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cart" 
ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart" 
ON public.cart_items FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their cart" 
ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
```

### Step 2: Verify in Supabase Dashboard

1. Go to **Table Editor** → `cart_items`
2. Click on **Policies** tab
3. ✅ Verify RLS is **Enabled**
4. ✅ Verify you see 4 policies listed

### Step 3: Test Your Application

1. Log in to your app
2. Add a product to cart
3. Go to `/cart` page
4. Verify items load correctly

## ✅ What to Enable/Tick in Supabase

### Must Enable:
- ✅ **Row Level Security (RLS)** on `cart_items` table (auto-enabled by script)
- ✅ **Authentication** (for users to have carts)

### Optional:
- ⚪ **Realtime** (only if you want live cart updates)

### Don't Need:
- ❌ Storage buckets
- ❌ Edge Functions
- ❌ Database webhooks

## 🔧 What Was Fixed

1. ✅ **Cart items now save per user** - Each user has their own cart
2. ✅ **Better error handling** - Shows actual error messages
3. ✅ **Stock validation** - Prevents adding more than available stock
4. ✅ **Improved loading states** - Better UX during operations

## 📋 Features

- ✅ Users can add products to cart
- ✅ Users can update quantities
- ✅ Users can remove items
- ✅ Cart persists across sessions
- ✅ Each user sees only their own cart
- ✅ Stock validation
- ✅ Checkbox selection for checkout

## 🐛 Troubleshooting

**"Failed to add to cart"**
- Check browser console for error details
- Verify you're logged in
- Ensure SQL script ran successfully

**"Failed to load cart items"**
- Check RLS policies are created
- Verify `products` table exists
- Check browser console for errors

**Cart not persisting**
- Verify RLS policies allow INSERT/UPDATE
- Check Supabase logs in dashboard

## 📝 Notes

- Cart items are automatically deleted when user account is deleted
- Cart items are automatically deleted when product is deleted
- Each user can only have one cart item per product (quantity updates instead)

