import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  
  if (req.method === "OPTIONS") {
    return handleCorsOptions(origin);
  }

  const corsHeaders = getCorsHeaders(origin);

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
    if (!user?.id || !user?.email) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // First try to get subscription from user_stripe_data table
    const { data: stripeData } = await supabaseClient
      .from("user_stripe_data")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let subscriptionId = stripeData?.stripe_subscription_id;

    // Fallback: If no stored data, look up by email in Stripe
    if (!subscriptionId) {
      logStep("No stored subscription, looking up by email");
      
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        logStep("No Stripe customer found");
        return new Response(
          JSON.stringify({ error: "No active subscription found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        logStep("No active subscription found for customer");
        return new Response(
          JSON.stringify({ error: "No active subscription found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      subscriptionId = subscriptions.data[0].id;
      
      // Store the found data for next time
      await supabaseClient
        .from("user_stripe_data")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      
      logStep("Found and stored subscription", { subscriptionId });
    }

    // Cancel at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      { cancel_at_period_end: true }
    );

    logStep("Subscription set to cancel", { 
      subscriptionId: subscription.id,
      cancelAt: subscription.cancel_at,
      currentPeriodEnd: subscription.current_period_end
    });

    // Update user's plan expiry in database
    const periodEndDate = new Date(subscription.current_period_end * 1000).toISOString();
    
    await supabaseClient
      .from("users")
      .update({
        plan_expires_at: periodEndDate,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription will be cancelled at the end of the billing period",
        cancels_at: periodEndDate
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});