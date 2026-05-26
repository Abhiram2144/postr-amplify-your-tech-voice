import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { BILLING_LIMITS, getBillingLimits, getBillingPlanFromProductId, getBillingPlanName, getDodoClient, getDodoWebhookSecret } from "../_shared/billing.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[DODO-WEBHOOK] ${step}${detailsStr}`);
};

const upsertBillingRecord = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  customerId?: string | null,
  subscriptionId?: string | null,
) => {
  const record: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (customerId !== undefined) record.stripe_customer_id = customerId;
  if (subscriptionId !== undefined) record.stripe_subscription_id = subscriptionId;

  await supabaseClient
    .from("user_stripe_data")
    .upsert(record, { onConflict: "user_id" });
};

const setUserPlan = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  productId: string,
  startedAt?: string | null,
  expiresAt?: string | null,
) => {
  const plan = getBillingPlanFromProductId(productId);
  const limits = getBillingLimits(plan);

  await supabaseClient
    .from("users")
    .update({
      plan: getBillingPlanName(plan),
      plan_started_at: startedAt ?? new Date().toISOString(),
      plan_expires_at: expiresAt ?? null,
      ...limits,
    })
    .eq("id", userId);
};

const downgradeToFree = async (supabaseClient: ReturnType<typeof createClient>, userId: string, keepCustomerId?: string | null) => {
  await supabaseClient
    .from("users")
    .update({
      plan: "free",
      plan_started_at: null,
      plan_expires_at: null,
      monthly_generation_limit: BILLING_LIMITS.free.monthly_generation_limit,
      monthly_video_limit: BILLING_LIMITS.free.monthly_video_limit,
    })
    .eq("id", userId);

  await upsertBillingRecord(supabaseClient, userId, keepCustomerId ?? null, null);
};

const syncSubscription = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  customerId: string,
  subscription: {
    subscription_id: string;
    product_id: string;
    previous_billing_date: string;
    next_billing_date: string;
    status?: string | null;
  },
) => {
  await setUserPlan(
    supabaseClient,
    userId,
    subscription.product_id,
    subscription.previous_billing_date,
    subscription.next_billing_date,
  );

  await upsertBillingRecord(supabaseClient, userId, customerId, subscription.subscription_id);
};

const findUserByEmail = async (supabaseClient: ReturnType<typeof createClient>, email: string) => {
  const { data, error } = await supabaseClient
    .from("users")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (error) throw error;
  return data?.[0]?.id ?? null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
        "Access-Control-Allow-Headers": "content-type, authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const webhookSecret = getDodoWebhookSecret();
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const dodo = getDodoClient();
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const event = dodo.webhooks.unwrap(body, { headers, key: webhookSecret });
    logStep("Event received", { type: event.type, businessId: event.business_id });

    switch (event.type) {
      case "payment.succeeded": {
        const payment = event.data;
        const userId = await findUserByEmail(supabaseClient, payment.customer.email);
        if (!userId) break;

        await upsertBillingRecord(supabaseClient, userId, payment.customer.customer_id, payment.subscription_id ?? null);

        if (payment.subscription_id) {
          const subscription = await dodo.subscriptions.retrieve(payment.subscription_id);
          await syncSubscription(supabaseClient, userId, payment.customer.customer_id, subscription);
        } else if (payment.product_cart?.[0]?.product_id) {
          await setUserPlan(
            supabaseClient,
            userId,
            payment.product_cart[0].product_id,
            payment.updated_at ?? payment.created_at ?? new Date().toISOString(),
            payment.updated_at ?? payment.created_at ?? null,
          );
        }
        break;
      }

      case "payment.failed":
      case "payment.processing":
      case "payment.cancelled": {
        const payment = event.data;
        const userId = await findUserByEmail(supabaseClient, payment.customer.email);
        if (!userId) break;

        await upsertBillingRecord(supabaseClient, userId, payment.customer.customer_id, payment.subscription_id ?? null);

        if (payment.subscription_id) {
          const subscription = await dodo.subscriptions.retrieve(payment.subscription_id);
          const status = (subscription.status || "").toLowerCase();
          if (status === "active" || status === "on_hold") {
            await syncSubscription(supabaseClient, userId, payment.customer.customer_id, subscription);
          } else if (status === "cancelled" || status === "expired" || status === "failed") {
            await downgradeToFree(supabaseClient, userId, payment.customer.customer_id);
          }
        }
        break;
      }

      case "subscription.active":
      case "subscription.renewed":
      case "subscription.plan_changed":
      case "subscription.updated":
      case "subscription.on_hold": {
        const subscription = event.data;
        const userId = await findUserByEmail(supabaseClient, subscription.customer.email);
        if (!userId) break;

        await syncSubscription(supabaseClient, userId, subscription.customer.customer_id, subscription);
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.failed": {
        const subscription = event.data;
        const userId = await findUserByEmail(supabaseClient, subscription.customer.email);
        if (!userId) break;

        await downgradeToFree(supabaseClient, userId, subscription.customer.customer_id);
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