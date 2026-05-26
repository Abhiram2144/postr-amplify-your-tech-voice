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

const ALLOWED_ORIGINS = [
  "https://postr-genius.lovable.app",
  "https://id-preview--4a84c60f-1875-4a85-aaf4-0085811561d6.lovable.app",
  "https://postr-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Credentials": "true",
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const suffix = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${suffix}`);
};

const getSafeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not authenticated") || msg.includes("authorization")) return "Authentication required. Please log in again.";
    if (msg.includes("dodo") || msg.includes("subscription") || msg.includes("customer")) return "Subscription service error. Please try again or contact support.";
    if (msg.includes("not set") || msg.includes("not configured")) return "Service temporarily unavailable. Please try again later.";
  }
  return "An error occurred. Please try again later.";
};

const updateFreePlan = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  customerId?: string | null,
) => {
  await supabaseClient.from("users").update({
    plan: "free",
    plan_started_at: null,
    plan_expires_at: null,
    subscription_status: "free",
    plan_override_by_admin: false,
    monthly_generation_limit: BILLING_LIMITS.free.monthly_generation_limit,
    monthly_video_limit: BILLING_LIMITS.free.monthly_video_limit,
  }).eq("id", userId);

  const record: Record<string, unknown> = {
    user_id: userId,
    stripe_subscription_id: null,
    updated_at: new Date().toISOString(),
  };
  if (customerId !== undefined) record.stripe_customer_id = customerId;
  await supabaseClient.from("user_stripe_data").upsert(record, { onConflict: "user_id" });
};

const updateActivePlan = async (
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
  const plan = getBillingPlanFromProductId(subscription.product_id);
  const limits = getBillingLimits(plan);

  const rawStatus = (subscription.status ?? "").toLowerCase();
  const subscriptionStatus: SubscriptionStatus =
    rawStatus === "on_hold" ? "on_hold" :
    subscription.cancel_at_next_billing_date ? "cancelling" :
    "active";

  await supabaseClient.from("users").update({
    plan: getBillingPlanName(plan),
    plan_started_at: subscription.previous_billing_date || new Date().toISOString(),
    plan_expires_at: subscription.next_billing_date || null,
    subscription_status: subscriptionStatus,
    plan_override_by_admin: false,
    ...limits,
  }).eq("id", userId);

  await supabaseClient.from("user_stripe_data").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.subscription_id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Check if an admin has manually overridden this user's plan — if so, skip Dodo sync
    const { data: userData } = await supabaseClient
      .from("users")
      .select("plan, plan_expires_at, subscription_status, plan_override_by_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (userData?.plan_override_by_admin) {
      logStep("Admin override active, returning DB values", { userId: user.id, plan: userData.plan });
      const plan = userData.plan ?? "free";
      const planLower = plan.toLowerCase();
      const isSubscribed = planLower !== "free";
      const isCancelling = userData.subscription_status === "cancelling";
      return new Response(JSON.stringify({
        subscribed: isSubscribed,
        plan: plan,
        subscription_end: isCancelling ? (userData.plan_expires_at ?? null) : null,
        subscription_id: null,
        cancelling_at: isCancelling ? (userData.plan_expires_at ?? null) : null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const { data: billingRecord } = await supabaseClient
      .from("user_stripe_data")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerPage = await dodo.customers.list({ email: user.email });
    const customer = customerPage.items?.[0] ?? null;

    const customerId = billingRecord?.stripe_customer_id ?? customer?.customer_id ?? null;
    const storedSubscriptionId = billingRecord?.stripe_subscription_id ?? null;

    const tryCurrentSubscription = async () => {
      if (!storedSubscriptionId) return null;
      try {
        return await dodo.subscriptions.retrieve(storedSubscriptionId);
      } catch {
        return null;
      }
    };

    const subscriptionFromStorage = await tryCurrentSubscription();
    if (subscriptionFromStorage) {
      await updateActivePlan(supabaseClient, user.id, customerId ?? subscriptionFromStorage.customer.customer_id, {
        subscription_id: subscriptionFromStorage.subscription_id,
        product_id: subscriptionFromStorage.product_id,
        previous_billing_date: subscriptionFromStorage.previous_billing_date,
        next_billing_date: subscriptionFromStorage.next_billing_date,
        status: subscriptionFromStorage.status,
        cancel_at_next_billing_date: subscriptionFromStorage.cancel_at_next_billing_date,
      });

      const isCancelling = subscriptionFromStorage.cancel_at_next_billing_date;
      return new Response(JSON.stringify({
        subscribed: true,
        plan: getBillingPlanName(getBillingPlanFromProductId(subscriptionFromStorage.product_id)),
        subscription_end: subscriptionFromStorage.next_billing_date || null,
        subscription_id: subscriptionFromStorage.subscription_id,
        cancelling_at: isCancelling ? subscriptionFromStorage.next_billing_date || null : null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    if (!customerId) {
      await updateFreePlan(supabaseClient, user.id);
      return new Response(JSON.stringify({ subscribed: false, plan: "free", subscription_end: null, subscription_id: null, cancelling_at: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const activePage = await dodo.subscriptions.list({ customer_id: customerId, status: "active" });
    let subscription = activePage.items?.[0] ?? null;

    if (!subscription) {
      const holdPage = await dodo.subscriptions.list({ customer_id: customerId, status: "on_hold" });
      subscription = holdPage.items?.[0] ?? null;
    }

    if (!subscription) {
      await updateFreePlan(supabaseClient, user.id, customerId);
      return new Response(JSON.stringify({ subscribed: false, plan: "free", subscription_end: null, subscription_id: null, cancelling_at: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    await updateActivePlan(supabaseClient, user.id, customerId, {
      subscription_id: subscription.subscription_id,
      product_id: subscription.product_id,
      previous_billing_date: subscription.previous_billing_date,
      next_billing_date: subscription.next_billing_date,
      status: subscription.status,
      cancel_at_next_billing_date: subscription.cancel_at_next_billing_date,
    });

    const isCancelling = subscription.cancel_at_next_billing_date;
    return new Response(JSON.stringify({
      subscribed: true,
      plan: getBillingPlanName(getBillingPlanFromProductId(subscription.product_id)),
      subscription_end: subscription.next_billing_date || null,
      subscription_id: subscription.subscription_id,
      cancelling_at: isCancelling ? subscription.next_billing_date || null : null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: getSafeErrorMessage(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
