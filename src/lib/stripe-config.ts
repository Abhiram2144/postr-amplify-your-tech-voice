// Stripe product and price configuration
export const STRIPE_PLANS = {
  creator: {
    name: "Creator",
    monthly: {
      priceId: "price_1T5prxBQwmCYtfWQfR9Lg29Z",
      productId: "prod_U3xnQlT6Gdm0Rt",
      price: 14,
    },
    yearly: {
      priceId: "price_1T5psOBQwmCYtfWQfbtELLOq",
      productId: "prod_U3xo7ERFEWBd2J",
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
      priceId: "", // TODO: create Pro Monthly price in Stripe dashboard
      productId: "",
      price: 29,
    },
    yearly: {
      priceId: "", // TODO: create Pro Yearly price in Stripe dashboard
      productId: "",
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
