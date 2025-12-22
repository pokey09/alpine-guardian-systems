import { supabase } from './supabaseClient';
import { getStripe } from './stripeClient';

/**
 * Starts a Stripe Checkout session via Supabase Edge Function `create-checkout-session`.
 * Expects items in shape: [{ priceId: string, quantity: number, isSubscription?: boolean }]
 */
export const startCheckout = async ({ items, customerEmail }) => {
  if (!items || items.length === 0) {
    throw new Error('No items to checkout.');
  }

  console.log('Starting checkout with items:', items);

  const stripe = await getStripe();

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      items,
      customerEmail,
    },
  });

  console.log('Function response:', { data, error });

  if (error) {
    console.error('Function error:', error);
    throw new Error(`Checkout failed: ${error.message}`);
  }

  if (data?.error) {
    console.error('Data error:', data.error);
    throw new Error(`Stripe error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
  }

  const { sessionId } = data || {};
  if (!sessionId) {
    console.error('No session ID returned. Full response:', data);
    throw new Error('Checkout session id not returned. Please check your Stripe configuration.');
  }

  console.log('Redirecting to Stripe checkout with session:', sessionId);
  const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
  if (redirectError) {
    console.error('Redirect error:', redirectError);
    throw redirectError;
  }
};
