import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import DodoPayments from "npm:dodopayments";

type SubscriptionAction = "cancel" | "restore";

const isDodoTestMode = () => {
  const mode = (Deno.env.get("DODO_PAYMENTS_ENV") ?? "").toLowerCase();
  return mode === "test" || mode === "test_mode" || mode === "testmode";
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
    throw new Error("DODO_PAYMENTS API key is not set");
  }

  return new DodoPayments({
    bearerToken: apiKey,
    webhookKey: getDodoWebhookSecret() || undefined,
    environment: isDodoTestMode() ? "test_mode" : "live_mode",
  });
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://postr-genius.lovable.app",
    "https://id-preview--4a84c60f-1875-4a85-aaf4-0085811561d6.lovable.app",
    "https://postr-one.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
  ];

  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const suffix = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ADMIN-SUBSCRIPTION] ${step}${suffix}`);
};

const getSafeErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getSubscriptionByUser = async (
  dodo: DodoPayments,
  email: string,
  storedSubscriptionId?: string | null,
) => {
  if (storedSubscriptionId) {
    try {
      return await dodo.subscriptions.retrieve(storedSubscriptionId);
    } catch {
      // Fall back to lookup by email below.
    }
  }

  const customerPage = await dodo.customers.list({ email });
  const customer = customerPage.items?.[0] ?? null;

  if (!customer?.customer_id) return null;

  const activeSubs = await dodo.subscriptions.list({ customer_id: customer.customer_id, status: "active" });
  let subscription = activeSubs.items?.[0] ?? null;

  if (!subscription) {
    const holdSubs = await dodo.subscriptions.list({ customer_id: customer.customer_id, status: "on_hold" });
    subscription = holdSubs.items?.[0] ?? null;
  }

  return subscription;
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) throw new Error(`Authentication error: ${authError.message}`);

    const currentUser = authData.user;
    if (!currentUser?.id) throw new Error("User not authenticated");

    const { data: roles, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id);

    if (roleError) throw roleError;
    const isAdmin = (roles ?? []).some((row) => row.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
    const action = payload.action as SubscriptionAction | undefined;

    if (!userId) throw new Error("userId is required");
    if (action !== "cancel" && action !== "restore") throw new Error("action must be cancel or restore");

    const { data: targetUser, error: targetUserError } = await supabaseClient
      .from("users")
      .select("id, email, plan, plan_expires_at")
      .eq("id", userId)
      .single();

    if (targetUserError) throw targetUserError;

    const { data: billingRecord, error: billingRecordError } = await supabaseClient
      .from("user_stripe_data")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (billingRecordError) throw billingRecordError;

    const dodo = getDodoClient();
    const subscription = await getSubscriptionByUser(dodo, targetUser.email, billingRecord?.stripe_subscription_id ?? null);

    if (!subscription) {
      return new Response(JSON.stringify({ error: "No active subscription found for this user" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shouldCancel = action === "cancel";

    const updatedSubscription = await dodo.subscriptions.update(subscription.subscription_id, {
      cancel_at_next_billing_date: shouldCancel,
    });

    const periodEnd = updatedSubscription.next_billing_date || null;

    await supabaseClient.from("users").update({
      plan: targetUser.plan,
      plan_expires_at: shouldCancel ? periodEnd : null,
      subscription_status: shouldCancel ? "cancelling" : "active",
      plan_override_by_admin: false,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    await supabaseClient.from("user_stripe_data").upsert({
      user_id: userId,
      stripe_customer_id: billingRecord?.stripe_customer_id ?? updatedSubscription.customer.customer_id,
      stripe_subscription_id: updatedSubscription.subscription_id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    logStep("Subscription updated", {
      userId,
      action,
      subscriptionId: updatedSubscription.subscription_id,
      periodEnd,
    });

    return new Response(JSON.stringify({
      success: true,
      action,
      subscription_id: updatedSubscription.subscription_id,
      plan_expires_at: shouldCancel ? periodEnd : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR", { message: getSafeErrorMessage(error) });
    return new Response(JSON.stringify({ error: getSafeErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});