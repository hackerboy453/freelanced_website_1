# Chatbot Troubleshooting Guide

## 🔍 Current Issue: "I'm having trouble connecting right now"

This error means the chatbot API is failing. Here's how to fix it:

## ✅ Quick Fixes

### 1. Check Server Logs
Look at your terminal where `npm run dev` is running. You should see error messages that tell you what's wrong.

### 2. Verify API Key
Make sure your `.env.local` file has:
```env
GEMINI_API_KEY=AIzaSyAvS7A7BXZ9HBfhO7yxdNAM2zZlPkqjT7A
```

### 3. Restart Server
After any changes to `.env.local`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🐛 Common Issues & Solutions

### Issue 1: Invalid API Key
**Error in logs:** "API_KEY_INVALID" or "401 Unauthorized"

**Solution:**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Check if your API key is active
3. Regenerate the key if needed
4. Update `.env.local` with the new key
5. Restart server

### Issue 2: Model Not Found
**Error in logs:** "model not found" or "404"

**Solution:**
The code now uses `gemini-1.5-flash`. If this doesn't work, try:
- `gemini-pro` (older model)
- `gemini-1.5-pro` (newer, more capable)

Edit `app/api/chat/route.ts` line 20 and change:
```typescript
model: "gemini-1.5-flash",
```
to:
```typescript
model: "gemini-pro",
```

### Issue 3: API Quota Exceeded
**Error in logs:** "quota" or "429 Too Many Requests"

**Solution:**
1. Check your API usage at [Google AI Studio](https://aistudio.google.com/)
2. Wait for quota to reset (usually daily)
3. Upgrade your API plan if needed

### Issue 4: Network Error
**Error in logs:** "network" or "fetch failed"

**Solution:**
1. Check your internet connection
2. Check if Google services are accessible
3. Try again in a few minutes

## 🔧 Debug Steps

### Step 1: Check Environment Variable
Add this temporarily to `app/api/chat/route.ts` after line 8:
```typescript
console.log("API Key exists:", !!apiKey)
console.log("API Key length:", apiKey?.length)
```

**Don't log the actual key!** Just check if it exists.

### Step 2: Test API Key Directly
You can test your API key using curl:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Replace `YOUR_API_KEY` with your actual key.

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try sending a chat message
4. Look for error messages

### Step 4: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try sending a chat message
4. Click on the `/api/chat` request
5. Check the Response tab for error details

## 📝 Updated Code Features

The code has been updated with:
- ✅ Better error messages (shows actual error)
- ✅ Improved logging (check server console)
- ✅ Uses `gemini-1.5-flash` model (faster, free tier)
- ✅ Better error handling in chatbot component

## 🎯 Next Steps

1. **Check your server terminal** for error messages
2. **Try the chatbot again** - it should show a more specific error
3. **Share the error message** from the server logs if it persists

## 🔗 Useful Links

- [Google AI Studio](https://aistudio.google.com/) - Manage API keys
- [Gemini API Documentation](https://ai.google.dev/docs) - API reference
- [Gemini Models](https://ai.google.dev/models/gemini) - Available models

## 💡 Model Names Reference

Available Gemini models:
- `gemini-1.5-flash` - Fast, free tier, recommended
- `gemini-1.5-pro` - More capable, may require paid tier
- `gemini-pro` - Older model, still available

If one doesn't work, try another!

