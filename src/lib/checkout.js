import { supabase } from './supabaseClient';
import { getStripe } from './stripeClient';

/**
 * Starts a Stripe Checkout session via Supabase Edge Function `create-checkout-session`.
 * Expects items in shape: [{ priceId: string, quantity: number }]
 */
export const startCheckout = async ({ items, customerEmail }) => {
  if (!items || items.length === 0) {
    throw new Error('No items to checkout.');
  }

  const stripe = await getStripe();

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      items,
      customerEmail,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const { sessionId } = data || {};
  if (!sessionId) {
    throw new Error('Checkout session id not returned.');
  }

  const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
  if (redirectError) {
    throw redirectError;
  }
};
