import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Sanitize log values to prevent log injection
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

const logStep = (step: string, details?: Record<string, unknown>) => {
  const sanitized = details ? sanitizeForLog(details) : undefined;
  const detailsStr = sanitized ? ` - ${JSON.stringify(sanitized)}` : '';
  console.log(`[GENERATE-CONTENT] ${step}${detailsStr}`);
};

// Safe error messages
const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Pass through intentional user-facing errors
    if (msg.includes("insufficient_credits") || msg.includes("limit exceeded") ||
        msg.includes("limit reached") || msg.includes("at least one platform")) {
      return error.message;
    }

    // Auth errors
    if (msg.includes("not authenticated") || msg.includes("jwt") ||
        msg.includes("authorization") || msg.includes("no authorization header")) {
      return "Authentication required. Please log in again.";
    }

    // Configuration errors
    if (msg.includes("not set") || msg.includes("not configured") ||
        msg.includes("_key") || msg.includes("_secret")) {
      return "Service temporarily unavailable. Please try again later.";
    }

    // Validation errors - pass through with generic message
    if (msg.includes("required") || msg.includes("invalid") ||
        msg.includes("must be") || msg.includes("at least")) {
      return "Invalid request. Please check your input and try again.";
    }

    // Database/profile errors
    if (msg.includes("profile") || msg.includes("database") ||
        msg.includes("supabase") || msg.includes("failed to get")) {
      return "Unable to load your profile. Please try again.";
    }

    // AI/generation errors
    if (msg.includes("ai") || msg.includes("gateway") || msg.includes("parse")) {
      return "Content generation failed. Please try again.";
    }

    // Rate limiting
    if (msg.includes("rate") || msg.includes("too many") || msg.includes("429")) {
      return "Too many requests. Please try again in a moment.";
    }
  }

  return "An error occurred. Please try again later.";
};

// Input validation schema
const generateContentSchema = z.object({
  mode: z.enum(["brief_topic", "script"]),
  topic: z.string().max(500, "Topic too long").optional(),
  audience: z.string().max(200, "Audience description too long").optional(),
  intent: z.string().max(200, "Intent too long").optional(),
  tone: z.string().max(200, "Tone too long").optional(),
  script_text: z.string().max(10000, "Script too long").optional(),
  platforms: z.array(
    z.string().max(50)
  ).min(1, "At least one platform must be selected").max(6, "Maximum 6 platforms allowed"),
}).refine(
  (data) => {
    if (data.mode === "brief_topic") {
      return !!data.topic && data.topic.trim().length > 0;
    }
    if (data.mode === "script") {
      return !!data.script_text && data.script_text.length >= 50;
    }
    return false;
  },
  { message: "Topic required for brief_topic mode, script_text (min 50 chars) required for script mode" }
);

// Platform-specific formatting instructions
const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  linkedin: "Format for LinkedIn: Professional tone, use line breaks for readability, start with a hook, include relevant emojis sparingly, end with a question or call-to-action. Optimal length: 1200-1500 characters.",
  instagram: "Format for Instagram: Casual and engaging, use emojis, break into short paragraphs, include a strong hook in the first line, end with a call-to-action. Optimal length: 800-1000 characters.",
  twitter: "Format for Twitter/X: Punchy and direct, under 280 characters, use thread format (🧵) if needed, include 1-2 relevant hashtags. Focus on the hook.",
  youtube: "Format for YouTube Shorts script: Structure as Hook (0-3s), Setup (3-10s), Main Points (10-45s), CTA (45-60s). Include timestamps and speaking notes.",
  threads: "Format for Threads: Conversational, authentic, use line breaks, can be longer than Twitter. Start with a hot take or question.",
  reddit: "Format for Reddit: Use markdown with bold headers, be informative, invite discussion, match the subreddit style. Include a TL;DR if long.",
};

interface AnalysisResult {
  clarityScore: number;
  hookStrength: number;
  engagementScore: number;
  structureScore: number;
  strengths: string[];
  improvements: string[];
}

interface PlatformOutput {
  platform: string;
  content: string;
}

serve(async (req) => {
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

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Validate request body
    const body = await req.json();
    const validation = generateContentSchema.safeParse(body);
    
    if (!validation.success) {
      logStep("Validation failed", { errors: validation.error.issues.map(i => i.message) });
      return new Response(
        JSON.stringify({ 
          error: "Invalid request parameters",
          details: validation.error.issues.map(i => i.message)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { mode, topic, audience, intent, tone, script_text, platforms } = validation.data;
    logStep("Request validated", { mode, platformCount: platforms.length });

    // Get user plan and usage
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("users")
      .select("plan, monthly_generation_limit, generations_used_this_month, usage_reset_month, usage_reset_year")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(`Failed to get user profile: ${profileError.message}`);
    logStep("User profile fetched", { plan: userProfile.plan, used: userProfile.generations_used_this_month, limit: userProfile.monthly_generation_limit });

    // Check if usage needs reset (month changed)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let usedThisMonth = userProfile.generations_used_this_month;

    if (userProfile.usage_reset_month !== currentMonth || userProfile.usage_reset_year !== currentYear) {
      usedThisMonth = 0;
      logStep("Monthly usage reset detected");
    }

    // Risk 1 Fix: Atomic credit check + increment (prevents race conditions)
    // Use UPDATE with WHERE condition to ensure only one request succeeds
    const { data: creditDeduction, error: creditError } = await supabaseClient
      .from("users")
      .update({
        generations_used_this_month: usedThisMonth + 1,
        usage_reset_month: currentMonth,
        usage_reset_year: currentYear,
      })
      .eq("id", user.id)
      .lte("generations_used_this_month", userProfile.monthly_generation_limit)
      .select("generations_used_this_month, monthly_generation_limit")
      .single();

    // If no rows updated, user is at/over limit (race condition caught)
    if (creditError || !creditDeduction) {
      logStep("Credit deduction failed (race condition or limit reached)", { 
        used: usedThisMonth, 
        limit: userProfile.monthly_generation_limit 
      });
      return new Response(JSON.stringify({ 
        error: "insufficient_credits",
        message: "You've reached your monthly generation limit. Upgrade your plan for more credits.",
        used: usedThisMonth,
        limit: userProfile.monthly_generation_limit
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402,
      });
    }

    logStep("Credit deducted atomically", { 
      newUsage: creditDeduction.generations_used_this_month,
      limit: creditDeduction.monthly_generation_limit 
    });

    // Get Lovable AI key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Construct the prompt based on mode
    let contentPrompt: string;
    
    if (mode === "brief_topic") {
      contentPrompt = `
You are a content creation expert. Create engaging social media content based on this brief:

Topic: ${topic}
Target Audience: ${audience || "General audience"}
Intent: ${intent || "Explain"}
Tone: ${tone || "Casual"}

First, analyze what would make compelling content about this topic for the target audience.
Then create platform-specific versions that feel native to each platform.
`;
    } else {
      contentPrompt = `
You are a content analysis and improvement expert. Analyze and improve this script while preserving the author's voice and intent:

ORIGINAL SCRIPT:
${script_text}

Your tasks:
1. Analyze the script for clarity, hook strength, engagement potential, and structure
2. Identify strengths and areas for improvement
3. Create improved versions for each requested platform
`;
    }

    // Build platform instructions
    const platformInstructions = platforms
      .map(p => PLATFORM_INSTRUCTIONS[p.toLowerCase()] || `Format for ${p}: Create platform-appropriate content.`)
      .join("\n\n");

    // Full system prompt
    const systemPrompt = `You are an expert social media content creator and analyst. 
You understand platform algorithms, engagement patterns, and what makes content go viral.
Always provide actionable, specific analysis and high-quality, platform-native content.
Never be generic - tailor everything to the specific topic and audience.`;

    const fullPrompt = `${contentPrompt}

PLATFORMS TO CREATE CONTENT FOR:
${platformInstructions}

RESPONSE FORMAT (use this exact JSON structure):
{
  "analysis": {
    "clarityScore": <0-100>,
    "hookStrength": <0-100>,
    "engagementScore": <0-100>,
    "structureScore": <0-100>,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"]
  },
  "outputs": [
    {"platform": "platform_name", "content": "full formatted content for this platform"},
    ...
  ]
}

Return ONLY valid JSON, no markdown code blocks or additional text.`;

    logStep("Calling Lovable AI");

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logStep("AI gateway error", { status: aiResponse.status });
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited", message: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "ai_credits_exhausted", message: "AI service credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("No content returned from AI");
    }

    logStep("AI response received", { length: aiContent.length });

    // Parse AI response
    let parsedResponse: { analysis: AnalysisResult; outputs: PlatformOutput[] };
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      logStep("Failed to parse AI response");
      throw new Error("Failed to parse AI response");
    }

    // Log usage (credit was already deducted atomically above)
    await supabaseClient.from("usage_logs").insert({
      user_id: user.id,
      action: `generate_content_${mode}`,
      units: 1,
    });

    logStep("Generation complete", { creditsUsed: 1, newTotal: creditDeduction.generations_used_this_month });

    return new Response(JSON.stringify({
      success: true,
      analysis: parsedResponse.analysis,
      outputs: parsedResponse.outputs,
      credits: {
        used: creditDeduction.generations_used_this_month,
        limit: creditDeduction.monthly_generation_limit,
        remaining: creditDeduction.monthly_generation_limit - creditDeduction.generations_used_this_month,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const detailedError = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: sanitizeForLog(detailedError) });
    
    const safeMessage = getSafeErrorMessage(error);
    return new Response(JSON.stringify({ error: safeMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
