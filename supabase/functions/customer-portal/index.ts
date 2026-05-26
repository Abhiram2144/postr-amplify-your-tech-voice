import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import DodoPayments from "npm:dodopayments";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
    throw new Error("DODO_PAYMENTS_LIVE_API_KEY is not set");
  }

  return new DodoPayments({
    bearerToken: apiKey,
    webhookKey: getDodoWebhookSecret() || undefined,
    environment: isDodoTestMode() ? "test_mode" : "live_mode",
  });
};

const getDisplayName = (email: string, fullName?: string | null) => {
  if (fullName && fullName.trim()) return fullName.trim();
  return email.split("@")[0] || email;
};

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
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
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
    if (msg.includes("dodo") || msg.includes("customer") || msg.includes("portal")) {
      return "Billing portal error. Please try again or contact support.";
    }
    if (msg.includes("not set") || msg.includes("not configured")) {
      return "Service temporarily unavailable. Please try again later.";
    }
    if (msg.includes("no dodo customer")) {
      return "No billing account found. Please subscribe to a plan first.";
    }
  }
  return "An error occurred. Please try again later.";
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const dodo = getDodoClient();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const { data: billingRecord } = await supabaseClient
       .from("user_stripe_data")
       .select("stripe_customer_id")
       .eq("user_id", user.id)
       .maybeSingle();

    let customerId = billingRecord?.stripe_customer_id ?? null;

    if (!customerId) {
      const customerPage = await dodo.customers.list({ email: user.email });
      customerId = customerPage.items?.[0]?.customer_id ?? null;
    }

    if (!customerId) {
      const createdCustomer = await dodo.customers.create({
        email: user.email,
        name: getDisplayName(user.email, user.user_metadata?.full_name ?? user.user_metadata?.name ?? null),
      });
      customerId = createdCustomer.customer_id;
    }

    if (!customerId) {
      throw new Error("No Dodo customer found for this user");
    }
    logStep("Found Dodo customer", { customerId });

    // Use validated origin or fallback
    const returnOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
      ? origin 
      : ALLOWED_ORIGINS[0];
      
    const portalSession = await dodo.customers.customerPortal.create(customerId, {
      return_url: `${returnOrigin}/dashboard/settings`,
    });
    logStep("Customer portal session created");

    return new Response(JSON.stringify({ url: portalSession.link }), {
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
