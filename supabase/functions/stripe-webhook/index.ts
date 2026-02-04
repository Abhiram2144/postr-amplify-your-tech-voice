import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Plan mapping based on Stripe product IDs
const PLAN_MAPPING: Record<string, string> = {
  "prod_TudTvHmO8aHfbk": "creator", // Creator monthly
  "prod_TudTM34FQe9Vi4": "creator", // Creator yearly
  "prod_TudTiux1EV47Av": "pro",     // Pro monthly
  "prod_TudTx04tgVMQig": "pro",     // Pro yearly
};

const PLAN_LIMITS: Record<string, { monthly_generation_limit: number; monthly_video_limit: number }> = {
  "free": { monthly_generation_limit: 10, monthly_video_limit: 2 },
  "creator": { monthly_generation_limit: 60, monthly_video_limit: 20 },
  "pro": { monthly_generation_limit: 150, monthly_video_limit: 999 },
};

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey) {
    logStep("ERROR: STRIPE_SECRET_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  if (!webhookSecret) {
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    
    // Always verify webhook signature - no fallback for unsigned requests
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No signature provided");
      return new Response("No signature", { status: 400 });
    }
    
    // Use constructEventAsync for Deno compatibility with SubtleCrypto
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });
        
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const productId = subscription.items.data[0].price.product as string;
          const plan = PLAN_MAPPING[productId] || "free";
          const limits = PLAN_LIMITS[plan];
          
          // Find user by email
          const customerEmail = session.customer_email || 
            (session.customer ? (await stripe.customers.retrieve(session.customer as string) as Stripe.Customer).email : null);
          
          if (customerEmail) {
            const { data: users, error } = await supabaseClient
              .from("users")
              .select("id")
              .eq("email", customerEmail)
              .limit(1);
            
            if (error) {
              logStep("Error finding user by email", { error: error.message });
            }
            
            if (users && users.length > 0) {
              const userId = users[0].id;
              
              // Get subscription start date safely
              const startDate = subscription.start_date 
                ? new Date(subscription.start_date * 1000).toISOString()
                : new Date().toISOString();
              
              // Update non-sensitive plan data in users table
              const { error: updateError } = await supabaseClient
                .from("users")
                .update({
                  plan,
                  plan_started_at: startDate,
                  plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                  ...limits
                })
                .eq("id", userId);
              
              if (updateError) {
                logStep("Error updating user plan", { error: updateError.message });
              }
              
              // Store sensitive Stripe IDs in admin-only table
              const { error: stripeDataError } = await supabaseClient
                .from("user_stripe_data")
                .upsert({
                  user_id: userId,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: subscription.id,
                  updated_at: new Date().toISOString()
                }, { onConflict: "user_id" });
              
              if (stripeDataError) {
                logStep("Error updating stripe data", { error: stripeDataError.message });
              }
              
              logStep("User updated after checkout", { userId, plan });
            }
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const productId = subscription.items.data[0].price.product as string;
        const plan = subscription.status === "active" ? (PLAN_MAPPING[productId] || "free") : "free";
        const limits = PLAN_LIMITS[plan];
        
        logStep("Subscription update", { subscriptionId: subscription.id, status: subscription.status, plan });
        
        // Find user by stripe_customer_id in user_stripe_data table
        const { data: stripeData, error: stripeError } = await supabaseClient
          .from("user_stripe_data")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        
        if (stripeError) {
          logStep("Error finding user by stripe customer id", { error: stripeError.message });
        }
        
        if (stripeData) {
          const userId = stripeData.user_id;
          
          // Get subscription start date safely
          const startDate = subscription.start_date 
            ? new Date(subscription.start_date * 1000).toISOString()
            : new Date().toISOString();
          
          // Update non-sensitive plan data in users table
          const { error: updateError } = await supabaseClient
            .from("users")
            .update({
              plan,
              plan_started_at: startDate,
              plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              ...limits
            })
            .eq("id", userId);
          
          if (updateError) {
            logStep("Error updating user plan", { error: updateError.message });
          }
          
          // Update subscription ID in stripe data table
          const { error: stripeDataError } = await supabaseClient
            .from("user_stripe_data")
            .update({
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
          
          if (stripeDataError) {
            logStep("Error updating stripe data", { error: stripeDataError.message });
          }
          
          logStep("User subscription updated", { userId, plan });
        } else {
          logStep("No user found for stripe customer", { customerId });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Subscription canceled", { subscriptionId: subscription.id });
        
        // Find user by stripe_customer_id in user_stripe_data table
        const { data: stripeData, error: stripeError } = await supabaseClient
          .from("user_stripe_data")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        
        if (stripeError) {
          logStep("Error finding user by stripe customer id", { error: stripeError.message });
        }
        
        if (stripeData) {
          const userId = stripeData.user_id;
          
          // Downgrade user to free plan
          const { error: updateError } = await supabaseClient
            .from("users")
            .update({
              plan: "free",
              plan_expires_at: null,
              ...PLAN_LIMITS["free"]
            })
            .eq("id", userId);
          
          if (updateError) {
            logStep("Error downgrading user", { error: updateError.message });
          }
          
          // Clear subscription ID in stripe data table
          const { error: stripeDataError } = await supabaseClient
            .from("user_stripe_data")
            .update({
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
          
          if (stripeDataError) {
            logStep("Error updating stripe data", { error: stripeDataError.message });
          }
          
          logStep("User downgraded to free", { userId });
        } else {
          logStep("No user found for stripe customer", { customerId });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
