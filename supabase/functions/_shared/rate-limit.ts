import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface RateLimitOptions {
  userId: string;
  action: string;
  limit: number;
  intervalSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  count: number;
  limit: number;
}

/**
 * Lightweight per-user rate limiting using the usage_logs table.
 * Counts recent actions in a sliding window to throttle abuse without extra infra.
 */
export const enforceRateLimit = async (
  supabaseClient: SupabaseClient,
  { userId, action, limit, intervalSeconds }: RateLimitOptions,
): Promise<RateLimitResult> => {
  const windowStart = new Date(Date.now() - intervalSeconds * 1000).toISOString();

  const { count, error } = await supabaseClient
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (error) {
    throw new Error(`Rate limit check failed: ${error.message}`);
  }

  const currentCount = count ?? 0;
  const allowed = currentCount < limit;

  return {
    allowed,
    retryAfterSeconds: allowed ? 0 : intervalSeconds,
    count: currentCount,
    limit,
  };
};
