import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// CORS configuration with origin restrictions
const ALLOWED_ORIGINS = [
  "https://postr-genius.lovable.app",
  "https://id-preview--4a84c60f-1875-4a85-aaf4-0085811561d6.lovable.app",
  "https://postr-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const sanitized = details ? sanitizeForLog(details) : undefined;
  const detailsStr = sanitized ? ` - ${JSON.stringify(sanitized)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Sanitize log values
const sanitizeForLog = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(/[\n\r\t\x00-\x1F]/g, " ").substring(0, 200);
  }
  if (typeof value === "object" && value !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeForLog(val);
    }
    return sanitized;
  }
  return value;
};

// Safe error messages
const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not authenticated") || msg.includes("jwt") ||
        msg.includes("authorization") || msg.includes("no authorization header")) {
      return "Authentication required. Please log in again.";
    }
    if (msg.includes("stripe") || msg.includes("subscription") || msg.includes("customer")) {
      return "Subscription service error. Please try again or contact support.";
    }
    if (msg.includes("not set") || msg.includes("not configured")) {
      return "Service temporarily unavailable. Please try again later.";
    }
  }
  return "An error occurred. Please try again later.";
};

// Plan mapping based on Stripe product IDs
const PLAN_MAPPING: Record<string, string> = {
  "prod_TudTvHmO8aHfbk": "creator", // Creator monthly
  "prod_TudTM34FQe9Vi4": "creator", // Creator yearly
  "prod_TudTiux1EV47Av": "pro",     // Pro monthly
  "prod_TudTx04tgVMQig": "pro",     // Pro yearly
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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
    logStep("User authenticated", { userId: user.id });

    const { data: stripeData } = await supabaseClient
      .from("user_stripe_data")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id || stripeData?.stripe_customer_id || null;

    if (!customerId) {
      logStep("No customer found, returning free plan");

      if (stripeData?.stripe_customer_id || stripeData?.stripe_subscription_id) {
        await supabaseClient
          .from("users")
          .update({
            plan: "free",
            plan_started_at: null,
            plan_expires_at: null,
            monthly_generation_limit: 10,
            monthly_video_limit: 2,
          })
          .eq("id", user.id);

        await supabaseClient
          .from("user_stripe_data")
          .update({
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      return new Response(JSON.stringify({
        subscribed: false,
        plan: "free",
        subscription_end: null,
        cancelling_at: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerIdValue = customerId;
    logStep("Found Stripe customer");

    const subscriptions = await stripe.subscriptions.list({
      customer: customerIdValue,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let plan = "free";
    let subscriptionEnd = null;
    let subscriptionId = null;
    let cancellingAt = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // Safely parse current_period_end
      const periodEnd = subscription.current_period_end;
      if (periodEnd && !isNaN(periodEnd)) {
        subscriptionEnd = new Date(periodEnd * 1000).toISOString();
      }
      
      subscriptionId = subscription.id;
      const productId = subscription.items.data[0].price.product as string;
      plan = PLAN_MAPPING[productId] || "free";
      
      // Check if subscription is set to cancel at period end
      if (subscription.cancel_at_period_end && subscriptionEnd) {
        cancellingAt = subscriptionEnd;
        logStep("Subscription set to cancel", { cancellingAt });
      }
      
      // Get subscription start date safely - use created timestamp if start_date missing
      let startDate: string;
      const startTimestamp = subscription.start_date || subscription.created;
      if (startTimestamp && !isNaN(startTimestamp)) {
        startDate = new Date(startTimestamp * 1000).toISOString();
      } else {
        startDate = new Date().toISOString();
      }
      
      logStep("Active subscription found", { plan, endDate: subscriptionEnd, cancellingAt });

      // Update user record with subscription info (non-sensitive data only)
      const limits = plan === "pro" 
        ? { monthly_generation_limit: 150, monthly_video_limit: 999 }
        : plan === "creator"
        ? { monthly_generation_limit: 60, monthly_video_limit: 20 }
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
          stripe_customer_id: customerIdValue,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      
      logStep("Updated user record and stripe data", { plan });
    } else {
      logStep("No active subscription found");

      if (stripeData?.stripe_customer_id || stripeData?.stripe_subscription_id) {
        await supabaseClient
          .from("users")
          .update({
            plan: "free",
            plan_started_at: null,
            plan_expires_at: null,
            monthly_generation_limit: 10,
            monthly_video_limit: 2,
          })
          .eq("id", user.id);

        await supabaseClient
          .from("user_stripe_data")
          .update({
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      subscription_end: subscriptionEnd,
      subscription_id: subscriptionId,
      cancelling_at: cancellingAt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const detailedError = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: detailedError });
    
    const safeMessage = getSafeErrorMessage(error);
    return new Response(JSON.stringify({ error: safeMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
