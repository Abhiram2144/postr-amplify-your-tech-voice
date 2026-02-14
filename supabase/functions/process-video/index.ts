import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

// CORS configuration
const ALLOWED_ORIGINS = [
  "https://postr-genius.lovable.app",
  "https://id-preview--4a84c60f-1875-4a85-aaf4-0085811561d6.lovable.app",
  "https://postr-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

const sanitizeForLog = (value: unknown): unknown => {
  if (typeof value === "string") return value.replace(/[\n\r\t\x00-\x1F]/g, " ").substring(0, 200);
  if (typeof value === "object" && value !== null) {
    const s: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) s[k] = sanitizeForLog(v);
    return s;
  }
  return value;
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const sanitized = details ? sanitizeForLog(details) : undefined;
  console.log(`[PROCESS-VIDEO] ${step}${sanitized ? ` - ${JSON.stringify(sanitized)}` : ""}`);
};

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not authenticated") || msg.includes("authorization")) return "Authentication required. Please log in again.";
    if (msg.includes("not configured")) return "Service temporarily unavailable. Please try again later.";
    if (msg.includes("timed out")) return "Video processing took too long. Please try a shorter video.";
    if (msg.includes("transcription failed")) return "Could not transcribe the video audio. The video may not have clear speech.";
    if (msg.includes("insufficient spoken")) return error.message;
    if (msg.includes("file too large")) return error.message;
    if (msg.includes("invalid file")) return error.message;
  }
  return "An error occurred processing the video. Please try again.";
};

// Input validation
const requestSchema = z.object({
  storagePath: z.string().min(1, "Storage path required"),
  fileName: z.string().min(1, "File name required"),
  fileSizeBytes: z.number().max(50 * 1024 * 1024, "File too large (max 50MB)"),
  durationSeconds: z.number().max(120, "Video too long (max 2 minutes)").optional(),
});

// Credit cost calculation based on actual backend costs
// AssemblyAI Nano: $0.00025/second, 1 credit ≈ $0.02
function calculateCreditCost(durationSeconds: number, tokenEstimate: number): number {
  const transcriptionCost = durationSeconds * 0.00025; // AssemblyAI cost
  const llmCost = (tokenEstimate / 1000) * 0.0001; // Rough LLM token cost
  const totalCost = transcriptionCost + llmCost;
  const credits = Math.max(1, Math.ceil(totalCost / 0.02)); // Min 1 credit, $0.02 per credit
  return credits;
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

  let storagePath: string | null = null;

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

    // Per-user burst rate limit to stop abuse of video processing (3 uploads per 10 minutes)
    const rateLimit = await enforceRateLimit(supabaseClient, {
      userId: user.id,
      action: "process_video_upload",
      limit: 3,
      intervalSeconds: 600,
    });

    if (!rateLimit.allowed) {
      logStep("Rate limit hit", { action: "process_video_upload", count: rateLimit.count });
      return new Response(JSON.stringify({
        error: "rate_limited",
        message: "Too many video uploads. Please wait before trying again.",
        retryAfter: rateLimit.retryAfterSeconds,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    const { data: profile, error: profileError } = await supabaseClient
      .from("users")
      .select("monthly_video_limit")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(`Failed to get user profile: ${profileError.message}`);

    const monthlyVideoLimit = profile?.monthly_video_limit ?? 2;

    const { count: videoUsageCount, error: usageError } = await supabaseClient
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("action", ["generate_content_video_upload", "generate_content_video"])
      .gte("created_at", monthStart.toISOString())
      .lt("created_at", monthEnd.toISOString());

    if (usageError) throw new Error(`Failed to check video usage: ${usageError.message}`);

    if ((videoUsageCount ?? 0) >= monthlyVideoLimit) {
      logStep("Video credit limit reached", { used: videoUsageCount, limit: monthlyVideoLimit });
      return new Response(JSON.stringify({
        error: "insufficient_credits",
        message: "You've reached your monthly video limit. Upgrade your plan for more video credits.",
        used: videoUsageCount,
        limit: monthlyVideoLimit,
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: validation.error.issues.map(i => i.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { storagePath: path, fileName, fileSizeBytes, durationSeconds } = validation.data;
    storagePath = path;
    logStep("Processing uploaded video", { fileName, fileSizeBytes, storagePath: path });

    // Verify the storage path belongs to this user
    if (!path.startsWith(`${user.id}/`)) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API keys
    const ASSEMBLYAI_API_KEY = Deno.env.get("ASSEMBLYAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!ASSEMBLYAI_API_KEY) throw new Error("ASSEMBLYAI_API_KEY is not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Generate signed URL for the uploaded video
    logStep("Generating signed URL");
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
      .from("videos")
      .createSignedUrl(path, 600); // 10 min expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      logStep("Signed URL error", { error: signedUrlError?.message });
      throw new Error("Failed to generate access URL for uploaded video");
    }

    const signedUrl = signedUrlData.signedUrl;
    logStep("Signed URL generated");

    // Step 2: Submit to AssemblyAI for transcription
    logStep("Submitting to AssemblyAI");
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: signedUrl,
        punctuate: true,
        format_text: true,
      }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      logStep("AssemblyAI submit error", { status: transcriptResponse.status, error: errorText });
      throw new Error("Failed to submit video for transcription");
    }

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;
    logStep("Transcription job submitted", { transcriptId });

    // Step 3: Poll for transcription completion
    interface TranscriptionResult {
      transcript: string;
      confidence: number;
      audioDuration: number;
      wordCount: number;
    }

    let transcriptionResult: TranscriptionResult | null = null;
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { "Authorization": ASSEMBLYAI_API_KEY },
      });

      if (!pollResponse.ok) {
        logStep("Poll error", { status: pollResponse.status });
        continue;
      }

      const pollData = await pollResponse.json();
      logStep("Polling transcription", { status: pollData.status, attempt: attempts });

      if (pollData.status === "completed") {
        transcriptionResult = {
          transcript: pollData.text || "",
          confidence: pollData.confidence || 0,
          audioDuration: pollData.audio_duration || durationSeconds || 0,
          wordCount: (pollData.words || []).length,
        };
        break;
      } else if (pollData.status === "error") {
        throw new Error(`Transcription failed: ${pollData.error || "Unknown error"}`);
      }
    }

    if (!transcriptionResult) {
      throw new Error("Transcription timed out. Please try again.");
    }

    logStep("Transcription completed", {
      length: transcriptionResult.transcript.length,
      confidence: transcriptionResult.confidence,
      duration: transcriptionResult.audioDuration,
    });

    // Step 4: Validate minimum transcript quality
    if (transcriptionResult.transcript.length < 120) {
      // Delete the video file (cleanup)
      await supabaseClient.storage.from("videos").remove([path]);
      logStep("Video deleted after insufficient transcript");

      return new Response(JSON.stringify({
        error: "insufficient_spoken_content",
        message: "This video does not contain enough spoken content to analyze meaningfully. Please upload a video with more speech.",
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 5: Normalize context
    const normalizedContext = {
      source_type: "uploaded_video" as const,
      transcript: transcriptionResult.transcript,
      duration_seconds: transcriptionResult.audioDuration,
      word_count: transcriptionResult.wordCount,
    };

    logStep("Context normalized", { wordCount: normalizedContext.word_count, duration: normalizedContext.duration_seconds });

    // Step 6: Infer intent using AI
    logStep("Inferring creator intent");

    const intentPrompt = `Analyze this video transcript and infer the creator's intent.

TRANSCRIPT:
${normalizedContext.transcript}

METADATA:
- Duration: ${normalizedContext.duration_seconds} seconds
- Word count: ${normalizedContext.word_count} words

Based on this content, analyze:
1. What is the primary intent? (educate, explain, inspire, sell, entertain)
2. Who is the target audience?
3. What is the overall tone? (educational, casual, bold, story-driven)
4. What is the core message in one sentence?
5. What are 3 key takeaways?
6. How confident are you in this inference? (0.0 to 1.0)

Respond ONLY with valid JSON in this exact format:
{
  "intent": "educate|explain|inspire|sell|entertain",
  "target_audience": "description of target audience",
  "tone": "educational|casual|bold|story-driven",
  "core_message": "one sentence summary",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "inference_confidence": 0.85
}`;

    const intentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert content analyst. Analyze content to understand creator intent. Be precise." },
          { role: "user", content: intentPrompt },
        ],
      }),
    });

    if (!intentResponse.ok) {
      if (intentResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (intentResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please contact support." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to analyze video intent");
    }

    const intentData = await intentResponse.json();
    const intentContent = intentData.choices?.[0]?.message?.content;

    interface IntentInference {
      intent: "educate" | "explain" | "inspire" | "sell" | "entertain";
      target_audience: string;
      tone: "educational" | "casual" | "bold" | "story-driven";
      core_message: string;
      key_takeaways: string[];
      inference_confidence: number;
    }

    let intentInference: IntentInference;
    try {
      const cleaned = intentContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      intentInference = JSON.parse(cleaned);
    } catch {
      logStep("Failed to parse intent, using defaults");
      intentInference = {
        intent: "explain",
        target_audience: "general audience",
        tone: "casual",
        core_message: "Key insights from the video",
        key_takeaways: ["Key insight from the video"],
        inference_confidence: 0.5,
      };
    }

    logStep("Intent inferred", { intent: intentInference.intent, confidence: intentInference.inference_confidence });

    // Step 7: Delete the video file (cleanup - transcript is all we need)
    const { error: deleteError } = await supabaseClient.storage.from("videos").remove([path]);
    if (deleteError) {
      logStep("Warning: Failed to delete video file", { error: deleteError.message });
    } else {
      logStep("Video file deleted after transcription");
    }
    storagePath = null; // Mark as cleaned up

    // Step 8: Calculate credit cost
    const estimatedTokens = normalizedContext.transcript.length * 1.5; // rough estimate
    const creditCost = calculateCreditCost(normalizedContext.duration_seconds, estimatedTokens);
    logStep("Credit cost calculated", { creditCost, duration: normalizedContext.duration_seconds });

    // Step 9: Log usage
    await supabaseClient.from("usage_logs").insert({
      user_id: user.id,
      action: "process_video_upload",
      units: creditCost,
    });

    return new Response(JSON.stringify({
      success: true,
      context: normalizedContext,
      intent: intentInference,
      metadata: {
        fileName,
        duration: normalizedContext.duration_seconds,
        wordCount: normalizedContext.word_count,
        transcriptLength: transcriptionResult.transcript.length,
        transcriptConfidence: transcriptionResult.confidence,
      },
      creditCost,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: sanitizeForLog(errorMessage) });

    // Cleanup on error: delete uploaded video if still exists
    if (storagePath) {
      try {
        await supabaseClient.storage.from("videos").remove([storagePath]);
        logStep("Video file cleaned up after error");
      } catch (cleanupError) {
        logStep("Cleanup failed", { error: String(cleanupError) });
      }
    }

    const safeMessage = getSafeErrorMessage(error);
    return new Response(JSON.stringify({ error: safeMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
