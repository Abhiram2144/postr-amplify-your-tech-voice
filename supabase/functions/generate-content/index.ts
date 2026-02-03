import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-CONTENT] ${step}${detailsStr}`);
};

// Platform-specific formatting instructions
const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  linkedin: "Format for LinkedIn: Professional tone, use line breaks for readability, start with a hook, include relevant emojis sparingly, end with a question or call-to-action. Optimal length: 1200-1500 characters.",
  instagram: "Format for Instagram: Casual and engaging, use emojis, break into short paragraphs, include a strong hook in the first line, end with a call-to-action. Optimal length: 800-1000 characters.",
  twitter: "Format for Twitter/X: Punchy and direct, under 280 characters, use thread format (🧵) if needed, include 1-2 relevant hashtags. Focus on the hook.",
  youtube: "Format for YouTube Shorts script: Structure as Hook (0-3s), Setup (3-10s), Main Points (10-45s), CTA (45-60s). Include timestamps and speaking notes.",
  threads: "Format for Threads: Conversational, authentic, use line breaks, can be longer than Twitter. Start with a hot take or question.",
  reddit: "Format for Reddit: Use markdown with bold headers, be informative, invite discussion, match the subreddit style. Include a TL;DR if long.",
};

interface GenerateRequest {
  mode: "brief_topic" | "script";
  topic?: string;
  audience?: string;
  intent?: string;
  tone?: string;
  script_text?: string;
  platforms: string[];
}

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

    // Credit check
    if (usedThisMonth >= userProfile.monthly_generation_limit) {
      logStep("Insufficient credits", { used: usedThisMonth, limit: userProfile.monthly_generation_limit });
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

    // Parse request
    const body: GenerateRequest = await req.json();
    const { mode, topic, audience, intent, tone, script_text, platforms } = body;
    logStep("Request parsed", { mode, platforms });

    if (!platforms || platforms.length === 0) {
      throw new Error("At least one platform must be selected");
    }

    // Get Lovable AI key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Construct the prompt based on mode
    let contentPrompt: string;
    
    if (mode === "brief_topic") {
      if (!topic) throw new Error("Topic is required for brief_topic mode");
      contentPrompt = `
You are a content creation expert. Create engaging social media content based on this brief:

Topic: ${topic}
Target Audience: ${audience || "General audience"}
Intent: ${intent || "Explain"}
Tone: ${tone || "Casual"}

First, analyze what would make compelling content about this topic for the target audience.
Then create platform-specific versions that feel native to each platform.
`;
    } else if (mode === "script") {
      if (!script_text || script_text.length < 50) {
        throw new Error("Script must be at least 50 characters for script mode");
      }
      contentPrompt = `
You are a content analysis and improvement expert. Analyze and improve this script while preserving the author's voice and intent:

ORIGINAL SCRIPT:
${script_text}

Your tasks:
1. Analyze the script for clarity, hook strength, engagement potential, and structure
2. Identify strengths and areas for improvement
3. Create improved versions for each requested platform
`;
    } else {
      throw new Error(`Invalid mode: ${mode}`);
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
      logStep("AI gateway error", { status: aiResponse.status, error: errorText });
      
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
      logStep("Failed to parse AI response", { error: String(parseError), content: aiContent.substring(0, 500) });
      throw new Error("Failed to parse AI response");
    }

    // Deduct credit after successful generation
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        generations_used_this_month: usedThisMonth + 1,
        usage_reset_month: currentMonth,
        usage_reset_year: currentYear,
      })
      .eq("id", user.id);

    if (updateError) {
      logStep("Failed to update usage", { error: updateError.message });
      // Don't fail the request, just log it
    }

    // Log usage
    await supabaseClient.from("usage_logs").insert({
      user_id: user.id,
      action: `generate_content_${mode}`,
      units: 1,
    });

    logStep("Generation complete", { creditsUsed: 1, newTotal: usedThisMonth + 1 });

    return new Response(JSON.stringify({
      success: true,
      analysis: parsedResponse.analysis,
      outputs: parsedResponse.outputs,
      credits: {
        used: usedThisMonth + 1,
        limit: userProfile.monthly_generation_limit,
        remaining: userProfile.monthly_generation_limit - (usedThisMonth + 1),
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
