# Razorpay Payment Gateway Setup Guide

## 📋 Prerequisites

1. A Razorpay account (Sign up at https://razorpay.com)
2. Access to Razorpay Dashboard

## 🔑 Getting Your Razorpay API Keys

### Step 1: Sign Up / Login to Razorpay

1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for a new account or login to your existing account

### Step 2: Access API Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. You'll see two types of keys:
   - **Test Mode Keys** (for testing)
   - **Live Mode Keys** (for production)

### Step 3: Copy Your Keys

For **Test Mode** (Development):
- **Key ID**: Copy the "Key ID" from Test Mode section
- **Key Secret**: Click "Reveal" to show the "Key Secret" and copy it

For **Live Mode** (Production):
- **Key ID**: Copy the "Key ID" from Live Mode section  
- **Key Secret**: Click "Reveal" to show the "Key Secret" and copy it

⚠️ **Important**: Keep your Key Secret secure and never share it publicly!

## 🔧 Configuration

### Step 4: Update .env.local File

Open your `.env.local` file in the project root and update the Razorpay keys:

```env
# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Note**: 
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are used server-side (API routes)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is used client-side (checkout form)
- Both Key IDs should be the same value

### Step 5: Restart Your Development Server

After updating `.env.local`, restart your server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 🧪 Testing

### Test Mode

1. Use Test Mode keys from Razorpay Dashboard
2. Use Razorpay test cards:
   - **Card Number**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Expiry**: Any future date (e.g., `12/25`)
   - **Name**: Any name

### Test UPI IDs

- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

## 🚀 Production Setup

### Before Going Live:

1. **Complete KYC**: Verify your business details in Razorpay Dashboard
2. **Switch to Live Mode**: Use Live Mode API keys instead of Test Mode keys
3. **Update .env.local**: Replace test keys with live keys
4. **Webhook Setup** (Optional): Configure webhooks for payment status updates

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)
- [Razorpay Dashboard](https://dashboard.razorpay.com)

## 🔒 Security Notes

- ✅ Never commit your actual API keys to version control
- ✅ `.env.local` is automatically ignored by git
- ✅ Keep your Key Secret secure
- ✅ Use Test Mode keys during development
- ✅ Switch to Live Mode keys only in production

## 🐛 Troubleshooting

### Payment Gateway Not Loading
- ✅ Check if Razorpay script is loading (check browser console)
- ✅ Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- ✅ Restart your development server

### Payment Creation Failed
- ✅ Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- ✅ Check server logs for detailed error messages
- ✅ Ensure you're using the correct mode (test/live) keys

### Payment Verification Failed
- ✅ Check if payment was actually successful in Razorpay Dashboard
- ✅ Verify signature verification logic
- ✅ Check server logs for verification errors

