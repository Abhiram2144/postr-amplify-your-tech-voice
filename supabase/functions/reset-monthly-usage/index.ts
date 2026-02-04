import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Risk 4 Fix: Scheduled function to reset monthly usage
 * 
 * This edge function should be called by:
 * 1. Supabase Cron (if available on your plan)
 * 2. External cron service (cron-job.org, etc)
 * 3. GitHub Actions scheduled workflow
 * 
 * Run this once per day (it's idempotent - safe to run multiple times)
 */

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify this is coming from a trusted source
    const authHeader = req.headers.get("authorization");
    const SECRET_KEY = Deno.env.get("CRON_SECRET_KEY"); // Set this in Supabase secrets
    
    if (!SECRET_KEY || !authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    console.log(`[RESET-USAGE] Starting monthly reset for ${currentMonth}/${currentYear}`);

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
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
