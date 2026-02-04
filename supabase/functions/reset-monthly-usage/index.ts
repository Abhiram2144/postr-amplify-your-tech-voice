import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

/**
 * Scheduled function to reset monthly usage
 * 
 * This edge function should be called by:
 * 1. Supabase Cron (if available on your plan)
 * 2. External cron service (cron-job.org, etc)
 * 3. GitHub Actions scheduled workflow
 * 
 * Security features:
 * - Requires strong CRON_SECRET_KEY for authentication
 * - Rate limiting: only one reset allowed per month
 * - Audit logging for all reset attempts
 * - Idempotent: safe to run multiple times in same month (will be rejected)
 * - Restricted CORS to approved domains only
 */

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCorsOptions(origin);
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const rateLimitKey = `admin_reset_${currentMonth}_${currentYear}`;

  try {
    // Verify this is coming from a trusted source
    const authHeader = req.headers.get("authorization");
    const SECRET_KEY = Deno.env.get("CRON_SECRET_KEY");
    
    // Validate secret exists and is strong enough
    if (!SECRET_KEY || SECRET_KEY.length < 32) {
      console.error("[RESET-USAGE] CRON_SECRET_KEY not set or too weak (min 32 chars)");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
      // Log unauthorized attempt (without exposing details)
      console.warn("[RESET-USAGE] Unauthorized attempt detected");
      
      // Audit log for security monitoring
      await supabaseClient.from("usage_logs").insert({
        user_id: null,
        action: `unauthorized_reset_attempt_${currentMonth}_${currentYear}`,
        units: 0,
      });
      
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[RESET-USAGE] Starting monthly reset for ${currentMonth}/${currentYear}`);

    // Rate limiting: Check if already reset this month
    const { data: existingReset, error: checkError } = await supabaseClient
      .from("usage_logs")
      .select("id")
      .eq("action", rateLimitKey)
      .single();

    if (existingReset) {
      console.log(`[RESET-USAGE] Already reset this month, skipping`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Monthly usage already reset this period",
          month: currentMonth,
          year: currentYear,
          skipped: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Call the database function to reset usage
    const { error } = await supabaseClient.rpc("reset_monthly_usage");

    if (error) {
      console.error("[RESET-USAGE] Error:", error);
      throw error;
    }

    // Get count of users for logging
    const { count } = await supabaseClient
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("usage_reset_month", currentMonth)
      .eq("usage_reset_year", currentYear);

    // Audit log: Record successful reset
    await supabaseClient.from("usage_logs").insert({
      user_id: null,
      action: rateLimitKey,
      units: count || 0,
    });

    console.log(`[RESET-USAGE] Success. Users with current reset date: ${count}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Monthly usage reset completed",
        month: currentMonth,
        year: currentYear,
        usersUpdated: count,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[RESET-USAGE] Error:", error);
    
    // Audit log for failed attempts
    await supabaseClient.from("usage_logs").insert({
      user_id: null,
      action: `failed_reset_${currentMonth}_${currentYear}`,
      units: 0,
    });
    
    return new Response(
      JSON.stringify({
        error: "Reset operation failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
