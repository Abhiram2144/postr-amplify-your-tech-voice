// Stripe product and price configuration
export const STRIPE_PLANS = {
  creator: {
    name: "Creator",
    monthly: {
      priceId: "price_1SwoC8H0ScE1y6GM38RcxUcw",
      productId: "prod_TudTvHmO8aHfbk",
      price: 14,
    },
    yearly: {
      priceId: "price_1SwoCPH0ScE1y6GMe5hmuwXU",
      productId: "prod_TudTM34FQe9Vi4",
      price: 134.40, // 20% off ($14 * 12 * 0.8)
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
      priceId: "price_1SwoCXH0ScE1y6GMgQlfMFgr",
      productId: "prod_TudTiux1EV47Av",
      price: 29,
    },
    yearly: {
      priceId: "price_1SwoCYH0ScE1y6GMbM9UqdfM",
      productId: "prod_TudTx04tgVMQig",
      price: 278.40, // 20% off ($29 * 12 * 0.8)
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
