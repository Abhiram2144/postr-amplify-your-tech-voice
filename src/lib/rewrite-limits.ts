// Rewrite limits based on user plan
export const REWRITE_LIMITS: Record<string, number> = {
  free: 1,
  creator: 3,
  pro: 5,
};

export const getRewriteLimit = (plan: string | null): number => {
  const normalizedPlan = (plan || "free").toLowerCase();
  return REWRITE_LIMITS[normalizedPlan] || REWRITE_LIMITS.free;
};

export const canRewriteContent = (
  plan: string | null,
  currentRewriteCount: number
): boolean => {
  const limit = getRewriteLimit(plan);
  return currentRewriteCount < limit;
};

export const getRemainingRewrites = (
  plan: string | null,
  currentRewriteCount: number
): number => {
  const limit = getRewriteLimit(plan);
  return Math.max(0, limit - currentRewriteCount);
};
