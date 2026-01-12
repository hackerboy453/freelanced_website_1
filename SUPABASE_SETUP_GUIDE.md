# Supabase Setup Guide for Cart Functionality

This guide will help you set up the cart functionality in your Supabase database.

## Step 1: Run the SQL Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `scripts/011_setup_cart_items.sql`
5. Click **Run** (or press Ctrl+Enter)

This script will:
- Create the `cart_items` table if it doesn't exist
- Set up Row Level Security (RLS) policies
- Create indexes for better performance
- Add triggers for automatic timestamp updates

## Step 2: Enable Row Level Security (RLS)

RLS should be automatically enabled by the script, but verify:

1. Go to **Table Editor** in Supabase Dashboard
2. Click on the `cart_items` table
3. Go to the **Policies** tab
4. Verify that RLS is enabled (should show "RLS Enabled")

## Step 3: Verify RLS Policies

You should see these 4 policies for `cart_items`:

1. **Users can view their own cart** (SELECT)
   - Allows users to view only their own cart items

2. **Users can add to their cart** (INSERT)
   - Allows users to add items to their own cart

3. **Users can update their cart** (UPDATE)
   - Allows users to update their own cart items

4. **Users can delete from their cart** (DELETE)
   - Allows users to delete items from their own cart

## Step 4: Check Required Settings

### Authentication Settings
1. Go to **Authentication** → **Settings**
2. Ensure **Enable Email Signup** is enabled (if using email auth)
3. Ensure **Enable Email Confirmations** is configured as needed

### API Settings
1. Go to **Project Settings** → **API**
2. Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your `.env.local` file

## Step 5: Test the Setup

1. **Test as a logged-in user:**
   - Sign up or log in to your application
   - Try adding a product to cart
   - Check if it appears in `/cart` page
   - Try updating quantity
   - Try removing items

2. **Verify in Supabase:**
   - Go to **Table Editor** → `cart_items`
   - You should see cart items with your user_id
   - Each user should only see their own cart items

## Troubleshooting

### Error: "Failed to add to cart"
- Check if the `cart_items` table exists
- Verify RLS policies are created
- Check browser console for detailed error messages
- Ensure you're logged in

### Error: "Failed to load cart items"
- Verify RLS policies allow SELECT operations
- Check if `products` table exists and has data
- Verify foreign key relationship between `cart_items` and `products`

### RLS Policy Issues
If policies aren't working:
1. Go to **Table Editor** → `cart_items` → **Policies**
2. Delete all existing policies
3. Re-run the SQL script `011_setup_cart_items.sql`

### Foreign Key Issues
If you get foreign key constraint errors:
- Ensure `products` table exists
- Ensure `auth.users` table exists (should be automatic)
- Check that product_id values match existing products

## What to Enable/Tick in Supabase

### ✅ Required Settings:

1. **Row Level Security (RLS)** - Must be enabled on `cart_items` table
2. **Authentication** - Must be enabled for users to have cart functionality
3. **Realtime** (Optional) - Can be enabled if you want real-time cart updates

### ❌ Not Required:
- Realtime subscriptions (unless you want live cart updates)
- Storage buckets (not needed for cart)
- Edge Functions (not needed for basic cart)

## Database Schema

The `cart_items` table has the following structure:

```sql
cart_items
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── product_id (UUID, Foreign Key → products)
├── quantity (INTEGER, Default: 1)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Security Notes

- Each user can only access their own cart items (enforced by RLS)
- Users cannot modify other users' carts
- Cart items are automatically deleted when a user account is deleted (CASCADE)
- Cart items are automatically deleted when a product is deleted (CASCADE)

## Next Steps

After setting up the cart:
1. Test adding products to cart
2. Test updating quantities
3. Test removing items
4. Test checkout flow
5. Verify cart persists across sessions

If you encounter any issues, check the browser console and Supabase logs for detailed error messages.

