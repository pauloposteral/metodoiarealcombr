import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, priceId, planSlug, billingPeriod } = await req.json();
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // ---- CREATE CHECKOUT SESSION ----
    if (action === "create-checkout") {
      // Find or create Stripe customer
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
      }

      // Fetch plan from DB
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("slug", planSlug)
        .single();

      if (!plan) {
        return new Response(JSON.stringify({ error: "Plan not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const selectedPriceId =
        billingPeriod === "yearly"
          ? plan.stripe_price_id_yearly
          : plan.stripe_price_id_monthly;

      if (!selectedPriceId) {
        return new Response(
          JSON.stringify({ error: "Stripe price not configured for this plan" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const origin = req.headers.get("origin") || "https://metodoiarealcombr.lovable.app";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: selectedPriceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/membros?checkout=success`,
        cancel_url: `${origin}/pricing?checkout=cancelled`,
        metadata: {
          supabase_user_id: user.id,
          plan_slug: planSlug,
        },
        subscription_data: {
          metadata: {
            supabase_user_id: user.id,
            plan_slug: planSlug,
          },
        },
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- CUSTOMER PORTAL ----
    if (action === "customer-portal") {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return new Response(
          JSON.stringify({ error: "No Stripe customer found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const origin = req.headers.get("origin") || "https://metodoiarealcombr.lovable.app";

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: `${origin}/membros`,
      });

      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
