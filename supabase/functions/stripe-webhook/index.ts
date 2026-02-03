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
  "creator": { monthly_generation_limit: 100, monthly_video_limit: 20 },
  "pro": { monthly_generation_limit: 999, monthly_video_limit: 999 },
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
            
            if (users && users.length > 0) {
              await supabaseClient
                .from("users")
                .update({
                  plan,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: subscription.id,
                  plan_started_at: new Date(subscription.start_date * 1000).toISOString(),
                  plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                  ...limits
                })
                .eq("id", users[0].id);
              
              logStep("User updated after checkout", { userId: users[0].id, plan });
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
        
        // Find user by stripe_customer_id
        const { data: users } = await supabaseClient
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .limit(1);
        
        if (users && users.length > 0) {
          await supabaseClient
            .from("users")
            .update({
              plan,
              stripe_subscription_id: subscription.id,
              plan_started_at: new Date(subscription.start_date * 1000).toISOString(),
              plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              ...limits
            })
            .eq("id", users[0].id);
          
          logStep("User subscription updated", { userId: users[0].id, plan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Subscription canceled", { subscriptionId: subscription.id });
        
        const { data: users } = await supabaseClient
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .limit(1);
        
        if (users && users.length > 0) {
          await supabaseClient
            .from("users")
            .update({
              plan: "free",
              stripe_subscription_id: null,
              plan_expires_at: null,
              ...PLAN_LIMITS["free"]
            })
            .eq("id", users[0].id);
          
          logStep("User downgraded to free", { userId: users[0].id });
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
