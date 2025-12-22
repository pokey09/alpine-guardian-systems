// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session --no-verify-jwt
// Env vars (server-side only):
//   STRIPE_SECRET_KEY
//   SITE_URL (e.g., https://alpineguardiansys.com)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.11.0?target=deno";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeSecret) {
  console.error("Missing STRIPE_SECRET_KEY");
}

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2023-10-16" }) : null;
const siteUrl = Deno.env.get("SITE_URL") || "https://alpineguardiansys.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("Checkout request received");

    if (!stripe) {
      console.error("Stripe not initialized");
      return json({ error: "Stripe not configured" }, 500);
    }

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    const { items, customerEmail } = body;

    if (!Array.isArray(items) || items.length === 0) {
      console.error("Invalid items:", items);
      return json({ error: "Items are required" }, 400);
    }

    const mode: "payment" | "subscription" = items.some((i) => i.isSubscription) ? "subscription" : "payment";
    console.log("Checkout mode:", mode);

    const line_items = items.map((item) => ({
      price: item.priceId,
      quantity: item.quantity || 1,
    }));
    console.log("Line items:", JSON.stringify(line_items));

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      payment_method_types: ["card"],
      line_items,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    console.log("Creating Stripe session with params:", JSON.stringify(sessionParams));
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("Session created:", session.id);

    return json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    console.error("Error details:", JSON.stringify(err));
    return json({
      error: err.message || "Unknown error",
      details: err.toString()
    }, 500);
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
