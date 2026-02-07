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
    if (!user?.id) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    // Get stripe data for user
    const { data: stripeData, error: stripeDataError } = await supabaseClient
      .from("user_stripe_data")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (stripeDataError) {
      logStep("Error fetching stripe data", { error: stripeDataError.message });
      throw new Error("Failed to fetch subscription data");
    }

    if (!stripeData?.stripe_subscription_id) {
      logStep("No active subscription found");
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Cancel at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(
      stripeData.stripe_subscription_id,
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
