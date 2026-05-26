// Dodo Payments product configuration
const DODO_CREATOR_PRODUCT_ID = import.meta.env.VITE_DODO_PAYMENTS_LIVE_CREATOR_PLAN_ID ?? "pdt_0NfdX0P9ZkOoqgRFPDbB0";
const DODO_PRO_PRODUCT_ID = import.meta.env.VITE_DODO_PAYMENTS_LIVE_PRO_PLAN_ID ?? "pdt_0NfdXA9uKpt86ZvHFlGfD";

export const STRIPE_PLANS = {
  creator: {
    name: "Creator",
    monthly: {
      priceId: DODO_CREATOR_PRODUCT_ID,
      productId: DODO_CREATOR_PRODUCT_ID,
      price: 8,
    },
    yearly: {
      priceId: DODO_CREATOR_PRODUCT_ID,
      productId: DODO_CREATOR_PRODUCT_ID,
      price: 76.80, // 20% off ($8 * 12 * 0.8)
      monthlyEquivalent: 11.20,
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
      price: 15,
    },
    yearly: {
      priceId: DODO_PRO_PRODUCT_ID,
      productId: DODO_PRO_PRODUCT_ID,
      price: 144, // 20% off ($15 * 12 * 0.8)
      monthlyEquivalent: 23.20,
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
