import DodoPayments from "npm:dodopayments";

export type BillingPlan = "free" | "creator" | "pro";

export const BILLING_LIMITS: Record<BillingPlan, { monthly_generation_limit: number; monthly_video_limit: number }> = {
  free: { monthly_generation_limit: 10, monthly_video_limit: 2 },
  creator: { monthly_generation_limit: 60, monthly_video_limit: 20 },
  pro: { monthly_generation_limit: 150, monthly_video_limit: 999 },
};

export const BILLING_PLAN_IDS = {
  creator: Deno.env.get("VITE_DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID")
    ?? Deno.env.get("DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID")
    ?? "",
  pro: Deno.env.get("VITE_DODO_PAYMENTS_LIVE_PRO_PLAN_ID")
    ?? Deno.env.get("DODO_PAYMENTS_LIVE_PRO_PLAN_ID")
    ?? "",
} as const;

export const getDodoApiKey = () =>
  Deno.env.get("DODO_PAYMENTS_LIVE_API_KEY")
  ?? Deno.env.get("DODO_PAYMENTS_API_KEY")
  ?? "";

export const getDodoWebhookSecret = () =>
  Deno.env.get("DODO_PAYMENTS_LIVE_WEBHOOK_SECRET")
  ?? Deno.env.get("DODO_PAYMENTS_WEBHOOK_KEY")
  ?? "";

export const getDodoClient = () => {
  const apiKey = getDodoApiKey();
  if (!apiKey) {
    throw new Error("DODO_PAYMENTS_LIVE_API_KEY is not set");
  }

  return new DodoPayments({
    bearerToken: apiKey,
    webhookKey: getDodoWebhookSecret() || undefined,
    environment: Deno.env.get("DODO_PAYMENTS_ENV") === "test_mode" ? "test_mode" : "live_mode",
  });
};

export const getBillingPlanFromProductId = (productId?: string | null): BillingPlan => {
  if (!productId) return "free";
  if (productId === BILLING_PLAN_IDS.creator) return "creator";
  if (productId === BILLING_PLAN_IDS.pro) return "pro";
  return "free";
};

export const getBillingLimits = (plan: BillingPlan) => BILLING_LIMITS[plan];

export const getBillingPlanName = (plan: BillingPlan) => {
  if (plan === "creator") return "Creator";
  if (plan === "pro") return "Pro";
  return "Free";
};

export const getDisplayName = (email: string, fullName?: string | null) => {
  if (fullName && fullName.trim()) return fullName.trim();
  return email.split("@")[0] || email;
};