// Dodo Payments product configuration
const isDodoTestMode = () => {
  const mode = (import.meta.env.VITE_DODO_PAYMENTS_ENV ?? "").toLowerCase();
  return mode === "test" || mode === "test_mode" || mode === "testmode";
};

const DODO_CREATOR_PRODUCT_ID = isDodoTestMode()
  ? import.meta.env.VITE_DODO_PAYMENTS_TEST_CREATOR_PLAN_ID
    ?? "pdt_0NffmIHXyeyk4FbvQp7ws"
  : import.meta.env.VITE_DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID
    ?? "pdt_0NfdX0P9ZkOoqgRFPDbB0";

const DODO_PRO_PRODUCT_ID = isDodoTestMode()
  ? import.meta.env.VITE_DODO_PAYMENTS_TEST_PRO_PLAN_ID
    ?? "pdt_0NffmNtlpKjbXPnkuOXmz"
  : import.meta.env.VITE_DODO_PAYMENTS_LIVE_PRO_PLAN_ID
    ?? "pdt_0NfdXA9uKpt86ZvHFlGfD";

export const STRIPE_PLANS = {
  creator: {
    name: "Creator",
    monthly: {
      priceId: DODO_CREATOR_PRODUCT_ID,
      productId: DODO_CREATOR_PRODUCT_ID,
      price: 5,
    },
    yearly: {
      priceId: DODO_CREATOR_PRODUCT_ID,
      productId: DODO_CREATOR_PRODUCT_ID,
      price: 48,
      monthlyEquivalent: 4,
    },
    limits: {
      ideasPerMonth: 60,
      videosPerMonth: 20,
      platforms: 5,
      projectsLimit: 10,
    },
  },
  pro: {
    name: "Pro",
    monthly: {
      priceId: DODO_PRO_PRODUCT_ID,
      productId: DODO_PRO_PRODUCT_ID,
      price: 10,
    },
    yearly: {
      priceId: DODO_PRO_PRODUCT_ID,
      productId: DODO_PRO_PRODUCT_ID,
      price: 96,
      monthlyEquivalent: 8,
    },
    limits: {
      ideasPerMonth: 150,
      videosPerMonth: 50,
      platforms: "all",
      priorityProcessing: true,
      projectsLimit: 50,
    },
  },
  free: {
    name: "Free",
    limits: {
      ideasPerMonth: 10,
      videosPerMonth: 2,
      platforms: 3,
      projectsLimit: 2,
    },
  },
} as const;

export type PlanType = "free" | "creator" | "pro";
export type BillingCycle = "monthly" | "yearly";
