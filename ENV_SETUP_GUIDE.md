# Environment Variables Setup Guide

## ⚠️ Required Environment Variables

Your `.env.local` file needs these environment variables to work properly:

### 1. Supabase Configuration (REQUIRED)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Google Gemini API Key (REQUIRED for Chatbot)

```env
GEMINI_API_KEY=AIzaSyAvS7A7BXZ9HBfhO7yxdNAM2zZlPkqjT7A
```

## 📝 How to Get Your Supabase Credentials

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (or create a new one)

### Step 2: Get API Settings
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:

   **Project URL:**
   - Look for "Project URL" section
   - Copy the URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

   **anon/public key:**
   - Look for "Project API keys" section
   - Find the `anon` `public` key
   - Click the eye icon to reveal it
   - Copy the key (it's a long string)

### Step 3: Update .env.local File

1. Open `.env.local` file in your project root
2. Replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyAvS7A7BXZ9HBfhO7yxdNAM2zZlPkqjT7A
```

### Step 4: Restart Your Development Server

**IMPORTANT:** After updating `.env.local`, you MUST restart your server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Quick Reference

### Where to Find Supabase Credentials:
- **Dashboard URL:** https://supabase.com/dashboard/project/_/settings/api
- **Direct Link:** Replace `_` with your project ID in the URL above

### Example .env.local File:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini API Key (for chatbot)
GEMINI_API_KEY=AIzaSyAvS7A7BXZ9HBfhO7yxdNAM2zZlPkqjT7A
```

## ✅ Verification

After setting up your environment variables:

1. **Restart your dev server**
2. **Check the browser console** - no Supabase errors
3. **Try logging in** - authentication should work
4. **Try the chatbot** - should respond with Gemini

## 🐛 Troubleshooting

### Error: "Your project's URL and Key are required"
- ✅ Check `.env.local` file exists in project root
- ✅ Verify variable names are correct (case-sensitive)
- ✅ Make sure there are no spaces around the `=` sign
- ✅ Restart your development server

### Error: "Invalid API key"
- ✅ Check you copied the full key (they're very long)
- ✅ Verify you're using the `anon` `public` key (not the `service_role` key)
- ✅ Make sure there are no extra quotes or spaces

### Environment variables not loading?
- ✅ File must be named exactly `.env.local` (not `.env` or `.env.local.txt`)
- ✅ File must be in the project root (same folder as `package.json`)
- ✅ Restart the dev server after changes
- ✅ Check for typos in variable names

## 🔒 Security Notes

- ✅ `.env.local` is automatically ignored by git (safe to commit)
- ✅ Never commit your actual API keys to version control
- ✅ Never share your `.env.local` file publicly
- ✅ The `anon` key is safe for client-side use (it's public by design)

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Settings](https://supabase.com/dashboard/project/_/settings/api)

