import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Plan mapping based on Stripe product IDs
const PLAN_MAPPING: Record<string, string> = {
  "prod_TudTvHmO8aHfbk": "creator", // Creator monthly
  "prod_TudTM34FQe9Vi4": "creator", // Creator yearly
  "prod_TudTiux1EV47Av": "pro",     // Pro monthly
  "prod_TudTx04tgVMQig": "pro",     // Pro yearly
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, returning free plan");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let plan = "free";
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionId = subscription.id;
      const productId = subscription.items.data[0].price.product as string;
      plan = PLAN_MAPPING[productId] || "free";
      
      // Get subscription start date safely (handle cases where it might not exist)
      const startDate = subscription.start_date 
        ? new Date(subscription.start_date * 1000).toISOString()
        : new Date().toISOString();
      
      logStep("Active subscription found", { subscriptionId, plan, productId, endDate: subscriptionEnd });

      // Update user record with subscription info (non-sensitive data only)
      const limits = plan === "pro" 
        ? { monthly_generation_limit: 999, monthly_video_limit: 999 }
        : plan === "creator"
        ? { monthly_generation_limit: 100, monthly_video_limit: 20 }
        : { monthly_generation_limit: 10, monthly_video_limit: 2 };

      await supabaseClient
        .from("users")
        .update({
          plan,
          plan_started_at: startDate,
          plan_expires_at: subscriptionEnd,
          ...limits
        })
        .eq("id", user.id);

      // Store sensitive Stripe data in separate admin-only table
      await supabaseClient
        .from("user_stripe_data")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      
      logStep("Updated user record and stripe data", { plan, limits });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      subscription_end: subscriptionEnd,
      subscription_id: subscriptionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
