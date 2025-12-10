// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session --no-verify-jwt
// Env vars (server-side only):
//   STRIPE_SECRET_KEY
//   SITE_URL (e.g., https://alpineguardiansys.com)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeSecret) {
  console.error("Missing STRIPE_SECRET_KEY");
}

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-12-18" }) : null;
const siteUrl = Deno.env.get("SITE_URL") || "https://alpineguardiansys.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (!stripe) {
      return json({ error: "Stripe not configured" }, 500);
    }

    const { items, customerEmail } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "Items are required" }, 400);
    }

    const mode: "payment" | "subscription" = items.some((i) => i.isSubscription) ? "subscription" : "payment";

    const line_items = items.map((item) => ({
      price: item.priceId,
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items,
      customer_email: customerEmail,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    });

    return json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return json({ error: err.message || "Unknown error" }, 500);
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
