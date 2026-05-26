import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getDodoClient } from "../_shared/billing.ts";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
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
    const dodo = getDodoClient();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabaseClient.auth.getUser(token);
    if (error) throw new Error(`Authentication error: ${error.message}`);

    const user = data.user;
    if (!user?.id || !user?.email) throw new Error("User not authenticated");

    const { data: billingRecord } = await supabaseClient
      .from("user_stripe_data")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let subscriptionId = billingRecord?.stripe_subscription_id ?? null;
    let customerId = billingRecord?.stripe_customer_id ?? null;

    if (subscriptionId) {
      try {
        const subscription = await dodo.subscriptions.retrieve(subscriptionId);
        customerId = subscription.customer.customer_id;
      } catch {
        subscriptionId = null;
      }
    }

    if (!subscriptionId || !customerId) {
      const customerPage = await dodo.customers.list({ email: user.email });
      customerId = customerPage.items?.[0]?.customer_id ?? null;
      if (customerId) {
        const activePage = await dodo.subscriptions.list({ customer_id: customerId, status: "active" });
        subscriptionId = activePage.items?.[0]?.subscription_id ?? null;

        if (!subscriptionId) {
          const holdPage = await dodo.subscriptions.list({ customer_id: customerId, status: "on_hold" });
          subscriptionId = holdPage.items?.[0]?.subscription_id ?? null;
        }
      }
    }

    if (!subscriptionId || !customerId) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const subscription = await dodo.subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: true,
    });

    const periodEndDate = subscription.next_billing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabaseClient.from("users").update({
      plan_expires_at: periodEndDate,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    await supabaseClient.from("user_stripe_data").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.subscription_id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription will be cancelled at the end of the billing period",
      cancels_at: periodEndDate,
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