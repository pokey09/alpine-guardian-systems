# Stripe Checkout Setup Guide

This document explains how to complete the Stripe checkout integration for Alpine Guardian Systems.

## ✅ What's Already Done

1. **Frontend Integration**:
   - Cart component with Stripe checkout button
   - Checkout handler in StoreFront and ProductDetail pages
   - Cart persistence with localStorage
   - Stripe client initialization

2. **Backend Integration**:
   - Supabase Edge Function: `create-checkout-session`
   - Proper CORS configuration
   - Support for both one-time payments and subscriptions

## 🔧 Required Configuration Steps

### 1. Run Database Migration

The Stripe-related columns need to be added to your Product table:

1. Go to: https://app.supabase.com/project/npevhmlqvcsutfrswrag/sql/new
2. Copy and paste the contents of `supabase-stripe-migration.sql`
3. Click "Run" to execute the migration

This adds the following columns:
- `is_subscription` (BOOLEAN)
- `subscription_interval` (TEXT)
- `stripe_product_id` (TEXT)
- `stripe_price_id` (TEXT)
- `stripe_recurring_price_id` (TEXT)

### 2. Deploy Supabase Edge Function

Deploy the checkout Edge Function:

```bash
supabase functions deploy create-checkout-session --no-verify-jwt
```

### 3. Set Environment Variables in Supabase

Go to: https://app.supabase.com/project/npevhmlqvcsutfrswrag/settings/functions

Add these environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `SITE_URL`: Your production site URL (e.g., `https://alpineguardiansys.com`)

### 4. Create Stripe Products and Prices

For each product in your store:

1. Go to https://dashboard.stripe.com/products
2. Create a product
3. Add a price (one-time or recurring)
4. Copy the Price ID (starts with `price_`)
5. In your admin dashboard, edit the product and paste the Price ID into:
   - `Stripe Price ID` for one-time purchases
   - `Stripe Recurring Price ID` for subscriptions

### 5. Test the Checkout Flow

**Testing with Stripe Test Mode:**

1. Use test keys in your environment variables
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiration date and any 3-digit CVC

**Production Checklist:**
- [ ] Database migration run successfully
- [x] Edge Function deployed ✅ (Version 4, Active)
- [x] Environment variables set in Supabase ✅
  - `STRIPE_SECRET_KEY` - Set from .env.local
  - `SITE_URL` - Set to `https://alpineguardiansys.com` ✅
- [ ] Stripe products created
- [ ] Price IDs added to products in admin
- [ ] Test checkout with test card
- [ ] Switch to live keys for production

## 🛍️ How Checkout Works

1. User adds items to cart
2. User clicks "Checkout with Stripe"
3. App calls Supabase Edge Function `create-checkout-session`
4. Edge Function creates Stripe Checkout session
5. User is redirected to Stripe's hosted checkout page
6. After payment:
   - Success: redirected to `/checkout/success`
   - Cancel: redirected to `/checkout/cancel`

## 🔒 Security Notes

- The `STRIPE_SECRET_KEY` is only stored server-side in Supabase
- The frontend only uses the publishable key (`VITE_STRIPE_PUBLISHABLE_KEY`)
- Edge Function is deployed with `--no-verify-jwt` to allow anonymous checkouts
- Customer email is optional but recommended

## 📝 Important Files

- `/supabase/functions/create-checkout-session/index.ts` - Edge Function
- `/src/lib/checkout.js` - Frontend checkout handler
- `/src/lib/stripeClient.js` - Stripe.js initialization
- `/src/components/store/Cart.jsx` - Cart component with checkout button
- `supabase-stripe-migration.sql` - Database migration

## ❓ Troubleshooting

**Issue: "No Stripe price IDs configured"**
- Solution: Add Stripe Price IDs to your products in the admin dashboard

**Issue: "Stripe not configured" error**
- Solution: Set `STRIPE_SECRET_KEY` in Supabase Function environment variables

**Issue: Checkout redirects to wrong URL**
- Solution: Update `SITE_URL` environment variable in Supabase

**Issue: CORS errors**
- Solution: The Edge Function already has CORS headers configured, ensure it's deployed

For more help, see: https://stripe.com/docs/checkout/quickstart
