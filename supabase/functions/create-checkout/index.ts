import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Input validation schema
const checkoutSchema = z.object({
  priceId: z.string()
    .min(1, "Price ID is required")
    .max(100, "Price ID too long")
    .regex(/^price_[a-zA-Z0-9_]+$/, "Invalid price ID format"),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
  embedded: z.boolean().optional(),
});

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
    if (msg.includes("stripe") || msg.includes("payment") || msg.includes("checkout")) {
      return "Payment service error. Please try again or contact support.";
    }
    if (msg.includes("not set") || msg.includes("not configured")) {
      return "Service temporarily unavailable. Please try again later.";
    }
    if (msg.includes("invalid") || msg.includes("required")) {
      return error.message;
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Validate request body
    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);
    
    if (!validation.success) {
      logStep("Validation failed", { errors: validation.error.issues });
      return new Response(
        JSON.stringify({ error: "Invalid request parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { priceId, billingCycle, embedded } = validation.data;
    logStep("Request validated", { priceId, billingCycle, embedded });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer");
    }

    // Use validated origin or fallback
    const returnOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
      ? origin 
      : ALLOWED_ORIGINS[0];
    
    // Create session with embedded mode support
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        user_id: user.id,
      },
    };

    // For embedded checkout, use ui_mode and return_url
    if (embedded) {
      sessionConfig.ui_mode = "embedded";
      sessionConfig.return_url = `${returnOrigin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionConfig.success_url = `${returnOrigin}/dashboard?checkout=success`;
      sessionConfig.cancel_url = `${returnOrigin}/pricing?checkout=canceled`;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, embedded });

    // Return client_secret for embedded mode, url for redirect mode
    if (embedded && session.client_secret) {
      return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
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
