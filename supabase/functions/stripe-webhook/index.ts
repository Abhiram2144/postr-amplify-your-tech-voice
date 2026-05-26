import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import DodoPayments from "npm:dodopayments";

type BillingPlan = "free" | "creator" | "pro";
type SubscriptionStatus = "free" | "active" | "cancelling" | "cancelled" | "expired" | "failed" | "on_hold";

const isDodoTestMode = () => {
  const mode = (Deno.env.get("DODO_PAYMENTS_ENV") ?? "").toLowerCase();
  return mode === "test" || mode === "test_mode" || mode === "testmode";
};

const BILLING_LIMITS: Record<BillingPlan, { monthly_generation_limit: number; monthly_video_limit: number }> = {
  free: { monthly_generation_limit: 10, monthly_video_limit: 2 },
  creator: { monthly_generation_limit: 60, monthly_video_limit: 20 },
  pro: { monthly_generation_limit: 150, monthly_video_limit: 999 },
};

const getBillingPlanIds = () => isDodoTestMode()
  ? {
    creator: Deno.env.get("VITE_DODO_PAYMENTS_TEST_CREATOR_PLAN_ID")
      ?? Deno.env.get("DODO_PAYMENTS_TEST_CREATOR_PLAN_ID")
      ?? "",
    pro: Deno.env.get("VITE_DODO_PAYMENTS_TEST_PRO_PLAN_ID")
      ?? Deno.env.get("DODO_PAYMENTS_TEST_PRO_PLAN_ID")
      ?? "",
  }
  : {
    creator: Deno.env.get("VITE_DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID")
      ?? Deno.env.get("DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID")
      ?? "",
    pro: Deno.env.get("VITE_DODO_PAYMENTS_LIVE_PRO_PLAN_ID")
      ?? Deno.env.get("DODO_PAYMENTS_LIVE_PRO_PLAN_ID")
      ?? "",
  };

const getDodoApiKey = () =>
  isDodoTestMode()
    ? Deno.env.get("DODO_PAYMENTS_TEST_API_KEY")
      ?? Deno.env.get("DODO_PAYMENTS_API_KEY")
      ?? ""
    : Deno.env.get("DODO_PAYMENTS_LIVE_API_KEY")
      ?? Deno.env.get("DODO_PAYMENTS_API_KEY")
      ?? "";

const getDodoWebhookSecret = () =>
  isDodoTestMode()
    ? Deno.env.get("DODO_PAYMENTS_TEST_WEBHOOK_SECRET")
      ?? Deno.env.get("DODO_PAYMENTS_WEBHOOK_KEY")
      ?? ""
    : Deno.env.get("DODO_PAYMENTS_LIVE_WEBHOOK_SECRET")
      ?? Deno.env.get("DODO_PAYMENTS_WEBHOOK_KEY")
      ?? "";

const getDodoClient = () => {
  const apiKey = getDodoApiKey();
  if (!apiKey) {
    throw new Error("DODO_PAYMENTS_LIVE_API_KEY is not set");
  }

  return new DodoPayments({
    bearerToken: apiKey,
    webhookKey: getDodoWebhookSecret() || undefined,
    environment: isDodoTestMode() ? "test_mode" : "live_mode",
  });
};

const getBillingPlanFromProductId = (productId?: string | null): BillingPlan => {
  const billingPlanIds = getBillingPlanIds();
  if (!productId) return "free";
  if (productId === billingPlanIds.creator) return "creator";
  if (productId === billingPlanIds.pro) return "pro";
  return "free";
};

const getBillingLimits = (plan: BillingPlan) => BILLING_LIMITS[plan];

const getBillingPlanName = (plan: BillingPlan) => {
  if (plan === "creator") return "Creator";
  if (plan === "pro") return "Pro";
  return "free";
};

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
  subscriptionStatus: SubscriptionStatus = "active",
) => {
  const plan = getBillingPlanFromProductId(productId);
  const limits = getBillingLimits(plan);

  await supabaseClient
    .from("users")
    .update({
      plan: getBillingPlanName(plan),
      plan_started_at: startedAt ?? new Date().toISOString(),
      plan_expires_at: expiresAt ?? null,
      subscription_status: subscriptionStatus,
      plan_override_by_admin: false,
      ...limits,
    })
    .eq("id", userId);
};

const downgradeToFree = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  keepCustomerId?: string | null,
  subscriptionStatus: SubscriptionStatus = "cancelled",
) => {
  await supabaseClient
    .from("users")
    .update({
      plan: "free",
      plan_started_at: null,
      plan_expires_at: null,
      subscription_status: subscriptionStatus,
      plan_override_by_admin: false,
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
    cancel_at_next_billing_date?: boolean | null;
  },
) => {
  const rawStatus = (subscription.status ?? "").toLowerCase();
  const subscriptionStatus: SubscriptionStatus =
    rawStatus === "on_hold" ? "on_hold" :
    subscription.cancel_at_next_billing_date ? "cancelling" :
    "active";

  await setUserPlan(
    supabaseClient,
    userId,
    subscription.product_id,
    subscription.previous_billing_date,
    subscription.next_billing_date,
    subscriptionStatus,
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
            "active",
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
            await downgradeToFree(supabaseClient, userId, payment.customer.customer_id, status as SubscriptionStatus);
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

      case "subscription.cancelled": {
        const subscription = event.data;
        const userId = await findUserByEmail(supabaseClient, subscription.customer.email);
        if (!userId) break;
        await downgradeToFree(supabaseClient, userId, subscription.customer.customer_id, "cancelled");
        break;
      }

      case "subscription.expired": {
        const subscription = event.data;
        const userId = await findUserByEmail(supabaseClient, subscription.customer.email);
        if (!userId) break;
        await downgradeToFree(supabaseClient, userId, subscription.customer.customer_id, "expired");
        break;
      }

      case "subscription.failed": {
        const subscription = event.data;
        const userId = await findUserByEmail(supabaseClient, subscription.customer.email);
        if (!userId) break;
        await downgradeToFree(supabaseClient, userId, subscription.customer.customer_id, "failed");
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
