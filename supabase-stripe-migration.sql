-- Stripe enablement for Alpine Guardian Systems
-- Run in Supabase SQL Editor

-- Add Stripe identifiers and subscription flags to Product
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS subscription_interval TEXT;
ALTER TABLE public."Product" DROP CONSTRAINT IF EXISTS product_subscription_interval_check;
ALTER TABLE public."Product" ADD CONSTRAINT product_subscription_interval_check CHECK (subscription_interval IN ('weekly','monthly','yearly') OR subscription_interval IS NULL);
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS stripe_recurring_price_id TEXT;

-- Helpful index for Stripe IDs
CREATE INDEX IF NOT EXISTS idx_product_stripe_price ON public."Product"(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_product_stripe_recurring_price ON public."Product"(stripe_recurring_price_id);
