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

const getBillingPlanIds = () => {
  const creator = [
    Deno.env.get("VITE_DODO_PAYMENTS_TEST_CREATOR_PLAN_ID"),
    Deno.env.get("DODO_PAYMENTS_TEST_CREATOR_PLAN_ID"),
    Deno.env.get("VITE_DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID"),
    Deno.env.get("DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID"),
    // Safe fallback defaults used by the frontend config.
    "pdt_0NffmIHXyeyk4FbvQp7ws",
    "pdt_0NfdX0P9ZkOoqgRFPDbB0",
  ].filter((id): id is string => Boolean(id));

  const pro = [
    Deno.env.get("VITE_DODO_PAYMENTS_TEST_PRO_PLAN_ID"),
    Deno.env.get("DODO_PAYMENTS_TEST_PRO_PLAN_ID"),
    Deno.env.get("VITE_DODO_PAYMENTS_LIVE_PRO_PLAN_ID"),
    Deno.env.get("DODO_PAYMENTS_LIVE_PRO_PLAN_ID"),
    // Safe fallback defaults used by the frontend config.
    "pdt_0NffmNtlpKjbXPnkuOXmz",
    "pdt_0NfdXA9uKpt86ZvHFlGfD",
  ].filter((id): id is string => Boolean(id));

  return { creator, pro };
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
  if (billingPlanIds.creator.includes(productId)) return "creator";
  if (billingPlanIds.pro.includes(productId)) return "pro";
  logStep("Unknown product_id when mapping plan", { productId, mode: isDodoTestMode() ? "test_mode" : "live_mode" });
  return "free";
};

const getBillingLimits = (plan: BillingPlan) => BILLING_LIMITS[plan];

const getBillingPlanName = (plan: BillingPlan) => {
  if (plan === "creator") return "Creator";
  if (plan === "pro") return "Pro";
  return "free";
};

const getCheckoutPlanFallback = (rawPlan?: string | null, rawPriceId?: string | null): BillingPlan => {
  const normalizedPlan = (rawPlan ?? "").toLowerCase();
  if (normalizedPlan.includes("pro")) return "pro";
  if (normalizedPlan.includes("creator")) return "creator";

  const normalizedPriceId = (rawPriceId ?? "").toLowerCase();
  if (normalizedPriceId.includes("pro")) return "pro";
  if (normalizedPriceId.includes("creator")) return "creator";

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

const recordBillingEvent = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  eventType: string,
  payload: Record<string, unknown>,
  details?: {
    eventId?: string | null;
    status?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    productId?: string | null;
    email?: string | null;
  },
) => {
  const { data, error } = await supabaseClient.from("billing_events").insert({
    user_id: userId,
    provider: "dodo",
    event_type: eventType,
    event_id: details?.eventId ?? null,
    status: details?.status ?? null,
    customer_id: details?.customerId ?? null,
    subscription_id: details?.subscriptionId ?? null,
    product_id: details?.productId ?? null,
    email: details?.email ?? null,
    payload,
    updated_at: new Date().toISOString(),
  }).select("id");

  if (error) {
    logStep("Billing event insert failed", { userId, eventType, error: error.message });
    throw error;
  }

  if (!data?.length) {
    throw new Error(`Billing event insert failed for ${eventType}: no rows returned for user ${userId}`);
  }
};

const updateUserPlanRow = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  values: Record<string, unknown>,
  context: string,
) => {
  logStep(`${context}: updating users row`, { userId, plan: values.plan, subscription_status: values.subscription_status });
  const { data, error } = await supabaseClient
    .from("users")
    .update(values)
    .eq("id", userId)
    .select("id");

  if (error) {
    logStep(`${context}: users update failed`, { userId, error: error.message });
    throw error;
  }

  if (!data?.length) {
    throw new Error(`${context}: no users row found for user ${userId}`);
  }

  logStep(`${context}: users update success`, { userId, rows: data.length });
};

const upsertUserStripeData = async (
  supabaseClient: ReturnType<typeof createClient>,
  record: Record<string, unknown>,
  context: string,
) => {
  const userId = typeof record.user_id === "string" ? record.user_id : "unknown";
  logStep(`${context}: upserting user_stripe_data`, { userId, subscriptionId: record.stripe_subscription_id ?? null });
  const { data, error } = await supabaseClient
    .from("user_stripe_data")
    .upsert(record, { onConflict: "user_id" })
    .select("user_id");

  if (error) {
    logStep(`${context}: user_stripe_data upsert failed`, { userId, error: error.message });
    throw error;
  }

  if (!data?.length) {
    throw new Error(`${context}: no user_stripe_data row returned for user ${userId}`);
  }

  logStep(`${context}: user_stripe_data upsert success`, { userId, rows: data.length });
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
  await updateUserPlanRow(supabaseClient, userId, {
    plan: "free",
    plan_started_at: null,
    plan_expires_at: null,
    subscription_status: "free",
    plan_override_by_admin: false,
    monthly_generation_limit: BILLING_LIMITS.free.monthly_generation_limit,
    monthly_video_limit: BILLING_LIMITS.free.monthly_video_limit,
  }, "updateFreePlan");

  const record: Record<string, unknown> = {
    user_id: userId,
    stripe_subscription_id: null,
    updated_at: new Date().toISOString(),
  };
  if (customerId !== undefined) record.stripe_customer_id = customerId;
  await upsertUserStripeData(supabaseClient, record, "updateFreePlan");
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

  await updateUserPlanRow(supabaseClient, userId, {
    plan: getBillingPlanName(plan),
    plan_started_at: subscription.previous_billing_date || new Date().toISOString(),
    plan_expires_at: subscription.next_billing_date || null,
    subscription_status: subscriptionStatus,
    plan_override_by_admin: false,
    ...limits,
  }, "updateActivePlan");

  await upsertUserStripeData(supabaseClient, {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.subscription_id,
    updated_at: new Date().toISOString(),
  }, "updateActivePlan");
};

const updateFromCheckoutFallback = async (
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  plan: BillingPlan,
  subscriptionId?: string | null,
) => {
  const limits = getBillingLimits(plan);

  await updateUserPlanRow(supabaseClient, userId, {
    plan: getBillingPlanName(plan),
    plan_started_at: new Date().toISOString(),
    plan_expires_at: null,
    subscription_status: "active",
    plan_override_by_admin: false,
    ...limits,
  }, "updateFromCheckoutFallback");

  const record: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (subscriptionId !== undefined) record.stripe_subscription_id = subscriptionId;

  await upsertUserStripeData(supabaseClient, record, "updateFromCheckoutFallback");
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

    // Optional body: caller may pass a known subscriptionId (e.g. from Dodo return URL)
    // to retrieve and sync it directly, skipping all customer-list timing issues.
    let requestedSubscriptionId: string | null = null;
    let requestedCheckoutPlan: BillingPlan = "free";
    try {
      const body = await req.json();
      if (typeof body?.subscriptionId === "string" && body.subscriptionId.trim()) {
        requestedSubscriptionId = body.subscriptionId.trim();
        logStep("Direct subscription ID provided", { id: requestedSubscriptionId });
      }
      requestedCheckoutPlan = getCheckoutPlanFallback(
        typeof body?.purchasedPlan === "string" ? body.purchasedPlan : null,
        typeof body?.purchasedPriceId === "string" ? body.purchasedPriceId : null,
      );
    } catch {
      // Body absent or not JSON — proceed without it
    }

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

    const isCheckoutSyncRequest = Boolean(requestedSubscriptionId) || requestedCheckoutPlan !== "free";

    if (userData?.plan_override_by_admin && !isCheckoutSyncRequest) {
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

    if (userData?.plan_override_by_admin) {
      logStep("Admin override present, but bypassing for checkout sync", {
        userId: user.id,
        plan: userData.plan,
        checkoutSubscriptionId: requestedSubscriptionId,
        checkoutPlan: requestedCheckoutPlan,
      });
    }

    // Fast path: if caller supplied a subscription_id (e.g. from Dodo's return URL),
    // retrieve it directly and sync — no need to list customers or subscriptions.
    if (requestedSubscriptionId) {
      try {
        const sub = await dodo.subscriptions.retrieve(requestedSubscriptionId);
        const subCustomerId = sub.customer.customer_id;
        await updateActivePlan(supabaseClient, user.id, subCustomerId, {
          subscription_id: sub.subscription_id,
          product_id: sub.product_id,
          previous_billing_date: sub.previous_billing_date,
          next_billing_date: sub.next_billing_date,
          status: sub.status,
          cancel_at_next_billing_date: sub.cancel_at_next_billing_date,
        });
        await recordBillingEvent(supabaseClient, user.id, "subscription.sync", {
          source: "direct_subscription_id",
          subscriptionId: sub.subscription_id,
          productId: sub.product_id,
          status: sub.status ?? "active",
          email: user.email,
        }, {
          status: sub.status ?? "active",
          customerId: subCustomerId,
          subscriptionId: sub.subscription_id,
          productId: sub.product_id,
          email: user.email,
        });
        const isCancelling = sub.cancel_at_next_billing_date;
        logStep("Synced via direct subscription ID", { subId: sub.subscription_id });
        return new Response(JSON.stringify({
          subscribed: true,
          plan: getBillingPlanName(getBillingPlanFromProductId(sub.product_id)),
          subscription_end: sub.next_billing_date || null,
          subscription_id: sub.subscription_id,
          cancelling_at: isCancelling ? sub.next_billing_date || null : null,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      } catch (err) {
        logStep("Direct subscription retrieval failed, falling through", {
          id: requestedSubscriptionId,
          error: err instanceof Error ? err.message : String(err),
        });
        if (requestedCheckoutPlan !== "free") {
          await updateFromCheckoutFallback(supabaseClient, user.id, requestedCheckoutPlan, requestedSubscriptionId);
          await recordBillingEvent(supabaseClient, user.id, "subscription.sync_fallback", {
            source: "checkout_return_url",
            purchasedPlan: requestedCheckoutPlan,
            subscriptionId: requestedSubscriptionId,
            email: user.email,
          }, {
            status: "active",
            subscriptionId: requestedSubscriptionId,
            email: user.email,
          });
          return new Response(JSON.stringify({
            subscribed: true,
            plan: getBillingPlanName(requestedCheckoutPlan),
            subscription_end: null,
            subscription_id: requestedSubscriptionId,
            cancelling_at: null,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }
      }
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
      await recordBillingEvent(supabaseClient, user.id, "subscription.sync", {
        source: "stored_subscription_id",
        subscriptionId: subscriptionFromStorage.subscription_id,
        productId: subscriptionFromStorage.product_id,
        status: subscriptionFromStorage.status ?? "active",
        email: user.email,
      }, {
        status: subscriptionFromStorage.status ?? "active",
        customerId: customerId ?? subscriptionFromStorage.customer.customer_id,
        subscriptionId: subscriptionFromStorage.subscription_id,
        productId: subscriptionFromStorage.product_id,
        email: user.email,
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

    // Helper: return current DB values without modifying them.
    // Used when Dodo has no subscription yet (e.g. brief window after checkout
    // before the webhook fires). Actual downgrades come from webhook events.
    const returnCurrentDbValues = () => {
      const dbPlan = userData?.plan ?? "free";
      const isPaid = dbPlan.toLowerCase() !== "free";
      const isCancelling = userData?.subscription_status === "cancelling";
      return new Response(JSON.stringify({
        subscribed: isPaid,
        plan: dbPlan,
        subscription_end: isCancelling ? (userData?.plan_expires_at ?? null) : null,
        subscription_id: null,
        cancelling_at: isCancelling ? (userData?.plan_expires_at ?? null) : null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    };

    if (!customerId) {
      // No Dodo customer at all → safe to reset only if they're already on free
      if ((userData?.plan ?? "free").toLowerCase() !== "free") {
        return returnCurrentDbValues();
      }
      if (requestedCheckoutPlan !== "free") {
        await updateFromCheckoutFallback(supabaseClient, user.id, requestedCheckoutPlan, requestedSubscriptionId);
        await recordBillingEvent(supabaseClient, user.id, "subscription.sync_fallback", {
          source: "checkout_return_url_no_customer",
          purchasedPlan: requestedCheckoutPlan,
          subscriptionId: requestedSubscriptionId,
          email: user.email,
        }, {
          status: "active",
          subscriptionId: requestedSubscriptionId,
          email: user.email,
        });
        return new Response(JSON.stringify({
          subscribed: true,
          plan: getBillingPlanName(requestedCheckoutPlan),
          subscription_end: null,
          subscription_id: requestedSubscriptionId,
          cancelling_at: null,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }
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
      // Dodo has no active subscription right now. If the user is on a paid plan
      // in our DB, don't reset — the payment webhook will do it if truly cancelled.
      // This prevents false downgrades in the brief window after checkout.
      if ((userData?.plan ?? "free").toLowerCase() !== "free") {
        return returnCurrentDbValues();
      }
      if (requestedCheckoutPlan !== "free") {
        await updateFromCheckoutFallback(supabaseClient, user.id, requestedCheckoutPlan, requestedSubscriptionId);
        await recordBillingEvent(supabaseClient, user.id, "subscription.sync_fallback", {
          source: "checkout_return_url_no_active_subscription",
          purchasedPlan: requestedCheckoutPlan,
          subscriptionId: requestedSubscriptionId,
          email: user.email,
        }, {
          status: "active",
          subscriptionId: requestedSubscriptionId,
          email: user.email,
        });
        return new Response(JSON.stringify({
          subscribed: true,
          plan: getBillingPlanName(requestedCheckoutPlan),
          subscription_end: null,
          subscription_id: requestedSubscriptionId,
          cancelling_at: null,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }
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
