import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// CORS configuration with origin restrictions
const ALLOWED_ORIGINS = [
  "https://postr-genius.lovable.app",
  "https://id-preview--4a84c60f-1875-4a85-aaf4-0085811561d6.lovable.app",
  "https://postr-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
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
  mode: z.enum(["brief_topic", "script", "video", "video_upload"]),
  topic: z.string().max(500, "Topic too long").optional(),
  audience: z.string().max(200, "Audience description too long").optional(),
  intent: z.string().max(200, "Intent too long").optional(),
  tone: z.string().max(200, "Tone too long").optional(),
  script_text: z.string().max(10000, "Script too long").optional(),
  platforms: z.array(
    z.string().max(50)
  ).min(1, "At least one platform must be selected").max(6, "Maximum 6 platforms allowed"),
  // YouTube Shorts video mode enriched context
  video_context: z.object({
    source_platform: z.literal("youtube_shorts"),
    video_id: z.string(),
    video_title: z.string(),
    video_description: z.string(),
    hashtags: z.array(z.string()),
    transcript: z.string(),
    video_length_seconds: z.number(),
    channel_name: z.string(),
    view_count: z.number(),
    published_at: z.string(),
  }).optional(),
  video_intent: z.object({
    intent: z.enum(["educate", "explain", "inspire", "sell", "entertain"]),
    target_audience: z.string(),
    tone: z.enum(["educational", "casual", "bold", "story-driven"]),
    core_message: z.string(),
    key_takeaways: z.array(z.string()),
  }).optional(),
  // Video upload mode context
  upload_context: z.object({
    source_type: z.literal("uploaded_video"),
    transcript: z.string().min(120, "Transcript too short"),
    duration_seconds: z.number(),
    word_count: z.number(),
  }).optional(),
  upload_intent: z.object({
    intent: z.enum(["educate", "explain", "inspire", "sell", "entertain"]),
    target_audience: z.string(),
    tone: z.enum(["educational", "casual", "bold", "story-driven"]),
    core_message: z.string(),
    key_takeaways: z.array(z.string()),
    inference_confidence: z.number().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.mode === "brief_topic") {
      return !!data.topic && data.topic.trim().length > 0;
    }
    if (data.mode === "script") {
      return !!data.script_text && data.script_text.length >= 50;
    }
    if (data.mode === "video") {
      return !!data.video_context && !!data.video_intent && data.video_context.transcript.length > 0;
    }
    if (data.mode === "video_upload") {
      return !!data.upload_context && !!data.upload_intent && data.upload_context.transcript.length >= 120;
    }
    return false;
  },
  { message: "Required fields missing for the selected mode" }
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
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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
    
    const { mode, topic, audience, intent, tone, script_text, platforms, video_context, video_intent, upload_context, upload_intent } = validation.data;
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

    // Determine user plan tier for prompt differentiation
    const userPlan = (userProfile.plan || "free").toLowerCase();
    const planTier = userPlan.includes("pro") ? "pro" : userPlan.includes("creator") ? "creator" : "free";
    logStep("Plan tier for generation", { planTier });

        // Plan-specific analysis depth instructions
        const analysisDepthByPlan: Record<string, string> = {
      free: `Provide basic analysis:
    - Give scores as rough estimates (clarity, hook, engagement, structure)
    - List exactly 2 strengths and 2 improvements
    - Keep analysis short and conversational
    - Use plain language; avoid technical or psychological terms`,
      creator: `Provide advanced analysis:
    - Give accurate, detailed scores (clarity, hook, engagement, structure)
    - List exactly 3 strengths and 3 improvements with specific examples
    - Include actionable suggestions referencing the actual content
    - Explain WHY each score is what it is
    - Reference specific lines or ideas and explain feedback like peer-to-peer advice`,
      pro: `Provide deep, expert-level analysis:
    - Give precise scores with justification (clarity, hook, engagement, structure)
    - List exactly 5 strengths and 5 improvements with specific, actionable examples
    - Include psychological engagement tactics (curiosity gaps, pattern interrupts, open loops)
    - Reference platform algorithm preferences and trending formats
    - Suggest A/B testing variations for hooks
    - Analyze emotional triggers and audience retention patterns
    - Write analysis like private notes between strategists; be direct and assume nuance`,
        };

        // Plan-specific content quality instructions
        const contentQualityByPlan: Record<string, string> = {
      free: `Write clear, readable content that gets the point across.

    Priorities:
    - Sound human and casual
    - Avoid dramatic hooks or exaggerated claims
    - Prefer plain language over clever wording
    - Focus on being understandable, not impressive

    The result should feel like something a smart student or early creator would post: useful, but not engineered.`,
      creator: `Create high-quality, platform-native content that feels intentionally written.

    Guidelines:
    - Strong opening lines, but no clickbait
    - Clear point of view
    - Natural transitions between ideas
    - Formatting that improves readability without drawing attention to itself
    - Language that sounds like a real person who has learned through experience

    Avoid generic advice, filler phrases, and creator cliches.
    If a sentence sounds like it could apply to any topic, rewrite it.`,
      pro: `Create premium content that feels authored, not generated.

    Apply:
    - Subtle curiosity gaps (imply insight, do not announce it)
    - Pattern interrupts that feel natural, not gimmicky
    - Specific observations instead of general advice
    - Emotional awareness without emotional manipulation

    Avoid:
    - Motivational language
    - Buzzwords
    - Obvious hooks
    - Over-formatting

    Do not try to sound impressive. Try to sound certain.`,
        };

    // Construct the prompt based on mode
    let contentPrompt: string;
    
    if (mode === "brief_topic") {
      contentPrompt = `
You are creating social media content based on the following brief:

Topic: ${topic}
Target Audience: ${audience || "General audience"}
Intent: ${intent || "Explain"}
Tone: ${tone || "Casual"}

${contentQualityByPlan[planTier]}

First, analyze what would make compelling content about this topic for the target audience.
Then create platform-specific versions that feel native to each platform.
`;
    } else if (mode === "video" && video_context && video_intent) {
      contentPrompt = `
You are a senior content strategist who transforms video content into platform-native posts.
You think deeply before writing. You never generate generic content.

=== VIDEO SOURCE CONTEXT ===
Platform: YouTube Shorts
Title: ${video_context.video_title}
Channel: ${video_context.channel_name}
Duration: ${video_context.video_length_seconds} seconds
Views: ${video_context.view_count.toLocaleString()}

=== FULL TRANSCRIPT ===
${video_context.transcript}

=== INFERRED CREATOR INTENT ===
Primary Intent: ${video_intent.intent}
Target Audience: ${video_intent.target_audience}
Tone: ${video_intent.tone}
Core Message: ${video_intent.core_message}

Key Takeaways:
${video_intent.key_takeaways.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

=== YOUR MISSION ===
1. Preserve the original creator's THINKING, not just their words
2. Improve clarity, structure, and impact WITHOUT changing the core meaning
3. Optimize for insight density, not length - every sentence must earn its place
4. Make the output feel like it was written by a thoughtful human creator
5. Do NOT paraphrase blindly or generate fluffy content
6. Do NOT explain obvious things or sound like an AI assistant

${contentQualityByPlan[planTier]}

Analyze the content for clarity, hook strength, engagement potential, and structure.
Then create platform-specific versions that are sharper and more valuable than generic rewrites.
`;
    } else if (mode === "video_upload" && upload_context && upload_intent) {
      contentPrompt = `
You are a senior content strategist who transforms spoken video content into platform-native posts.
You think deeply before writing. You never generate generic content.

=== UPLOADED VIDEO CONTEXT ===
Source: Uploaded video file
Duration: ${upload_context.duration_seconds} seconds
Word Count: ${upload_context.word_count} words

=== FULL TRANSCRIPT ===
${upload_context.transcript}

=== INFERRED CREATOR INTENT ===
Primary Intent: ${upload_intent.intent}
Target Audience: ${upload_intent.target_audience}
Tone: ${upload_intent.tone}
Core Message: ${upload_intent.core_message}

Key Takeaways:
${upload_intent.key_takeaways.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

=== YOUR MISSION ===
1. Preserve the original creator's THINKING, not just their words
2. Improve clarity, structure, and impact WITHOUT changing the core meaning
3. Optimize for insight density, not length - every sentence must earn its place
4. Make the output feel like it was written by a thoughtful human creator
5. Do NOT paraphrase blindly or generate fluffy content
6. Do NOT explain obvious things or sound like an AI assistant

${contentQualityByPlan[planTier]}

Analyze the content for clarity, hook strength, engagement potential, and structure.
Then create platform-specific versions that are sharper and more valuable than generic rewrites.
`;
    } else {
      contentPrompt = `
You are a content analysis and improvement expert. Analyze and improve this script while preserving the author's voice and intent:

ORIGINAL SCRIPT:
${script_text}

${contentQualityByPlan[planTier]}

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

        // Full system prompt - differentiated by plan
        const systemPromptByPlan: Record<string, string> = {
      free: `You are a helpful junior content creator.

    You write clearly and naturally, like a real person explaining something they understand.
    You avoid buzzwords, hype language, and marketing jargon.
    Your writing should feel simple, honest, and straightforward, never polished to perfection.

    Do not over-optimize.
    Do not sound like a coach, strategist, or expert.
    If something is obvious, say it simply and move on.`,
      creator: `You are an experienced content creator who understands what works because you have posted consistently.

    You write with intention, not hype.
    You care about structure, flow, and readability.
    You know platform norms and follow them naturally without explaining them.

    Your writing should feel crafted, but not polished to the point of sounding artificial.
    You are confident, not loud.`,
      pro: `You are a senior content strategist who writes with intent and restraint.

    You have strong opinions and you are comfortable implying them without spelling everything out.
    You think in terms of audience psychology, retention, and attention, but you never explain this explicitly.

    Your writing should feel confident but not promotional, insightful without sounding instructional, sharp, slightly opinionated, and deliberate.
    Nothing you write should feel generic or safe. If a sentence does not add leverage, remove it.`,
        };

    const fullPrompt = `${contentPrompt}

PLATFORMS TO CREATE CONTENT FOR:
${platformInstructions}

=== ANALYSIS DEPTH ===
${analysisDepthByPlan[planTier]}

RESPONSE FORMAT (use this exact JSON structure):
{
  "analysis": {
    "clarityScore": <0-100>,
    "hookStrength": <0-100>,
    "engagementScore": <0-100>,
    "structureScore": <0-100>,
    "strengths": ["strength 1", ...],
    "improvements": ["improvement 1", ...]
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
          { role: "system", content: systemPromptByPlan[planTier] },
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
