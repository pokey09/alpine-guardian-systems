import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Stripe publishable key missing. Set VITE_STRIPE_PUBLISHABLE_KEY.');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
