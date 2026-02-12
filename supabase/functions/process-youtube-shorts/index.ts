import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

// Sanitize log values
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
  console.log(`[PROCESS-YT-SHORTS] ${step}${detailsStr}`);
};

// Input validation
const requestSchema = z.object({
  videoUrl: z.string().url("Invalid URL").max(500, "URL too long"),
});

// YouTube URL patterns
const YOUTUBE_SHORTS_PATTERNS = [
  /(?:youtube\.com\/shorts\/)([\w-]+)/,
  /(?:youtu\.be\/)([\w-]+)/,
  /(?:youtube\.com\/watch\?v=)([\w-]+)/,
];

function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_SHORTS_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

interface YouTubeMetadata {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
}

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words?: Array<{ text: string; start: number; end: number }>;
}

interface NormalizedContext {
  source_platform: "youtube_shorts";
  video_id: string;
  video_title: string;
  video_description: string;
  hashtags: string[];
  transcript: string;
  video_length_seconds: number;
  channel_name: string;
  view_count: number;
  published_at: string;
}

interface IntentInference {
  intent: "educate" | "explain" | "inspire" | "sell" | "entertain";
  target_audience: string;
  tone: "educational" | "casual" | "bold" | "story-driven";
  core_message: string;
  key_takeaways: string[];
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Extract hashtags from description
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.map(h => h.toLowerCase()) : [];
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  const bypassAuth = Deno.env.get("BYPASS_AUTH") === "true";

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

    if (!bypassAuth) {
      // Auth check
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("No authorization header provided");

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      const user = userData.user;
      if (!user?.id) throw new Error("User not authenticated");
      logStep("User authenticated", { userId: user.id });
    } else {
      logStep("Auth bypassed for local testing");
    }

    // Validate request
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { videoUrl } = validation.data;
    logStep("Processing video URL", { url: videoUrl });

    // Extract video ID
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Invalid YouTube URL. Please provide a valid YouTube Shorts link." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    logStep("Video ID extracted", { videoId });

    // Check for cached transcription
    // TODO: Implement caching in a dedicated table to avoid repeated costs

    // Get API keys
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const ASSEMBLYAI_API_KEY = Deno.env.get("ASSEMBLYAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not configured");
    }
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error("ASSEMBLYAI_API_KEY is not configured");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: Fetch YouTube metadata
    logStep("Fetching YouTube metadata");
    const ytResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${YOUTUBE_API_KEY}`
    );

    if (!ytResponse.ok) {
      const errorText = await ytResponse.text();
      logStep("YouTube API error", { status: ytResponse.status, error: errorText });
      throw new Error("Failed to fetch video metadata from YouTube");
    }

    const ytData = await ytResponse.json();
    if (!ytData.items || ytData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Video not found. It may be private or unavailable." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videoInfo = ytData.items[0];
    const metadata: YouTubeMetadata = {
      videoId,
      title: videoInfo.snippet?.title || "",
      description: videoInfo.snippet?.description || "",
      tags: videoInfo.snippet?.tags || [],
      channelTitle: videoInfo.snippet?.channelTitle || "",
      duration: videoInfo.contentDetails?.duration || "PT0S",
      viewCount: videoInfo.statistics?.viewCount || "0",
      publishedAt: videoInfo.snippet?.publishedAt || "",
    };
    logStep("YouTube metadata fetched", { title: metadata.title, channel: metadata.channelTitle });

    // Step 2: Extract audio URL using cobalt.tools API
    // This service extracts direct audio URLs from YouTube videos
    logStep("Extracting audio URL via cobalt");
    
    const cobaltResponse = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: "audio",
        audioFormat: "mp3",
      }),
    });

    if (!cobaltResponse.ok) {
      const errorText = await cobaltResponse.text();
      logStep("Cobalt extraction error", { status: cobaltResponse.status, error: errorText });
      throw new Error("Failed to extract audio from video. Please try again later.");
    }

    const cobaltData = await cobaltResponse.json();
    logStep("Cobalt response", { status: cobaltData.status });

    // Check if we got a valid audio URL
    let audioUrl: string;
    if (cobaltData.status === "stream" || cobaltData.status === "redirect") {
      audioUrl = cobaltData.url;
    } else if (cobaltData.status === "tunnel") {
      audioUrl = cobaltData.url;
    } else if (cobaltData.status === "picker" && cobaltData.picker?.length > 0) {
      // If multiple options, pick the first audio one
      const audioOption = cobaltData.picker.find((p: { type?: string }) => p.type === "audio") || cobaltData.picker[0];
      audioUrl = audioOption.url;
    } else if (cobaltData.status === "error") {
      throw new Error(`Audio extraction failed: ${cobaltData.error?.code || "unknown error"}`);
    } else {
      throw new Error("Could not extract audio URL from video");
    }

    logStep("Audio URL extracted", { urlLength: audioUrl.length });
    
    // Step 3: Submit to AssemblyAI for transcription
    logStep("Submitting to AssemblyAI");
    
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        punctuate: true,
        format_text: true,
        speaker_labels: true,
      }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      logStep("AssemblyAI submit error", { status: transcriptResponse.status, error: errorText });
      throw new Error("Failed to submit audio for transcription");
    }

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;
    logStep("Transcription job submitted", { transcriptId });

    // Step 4: Poll for transcription completion
    let transcriptionResult: TranscriptionResult | null = null;
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
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
          words: pollData.words,
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
      confidence: transcriptionResult.confidence 
    });

    // Step 5: Normalize context
    const normalizedContext: NormalizedContext = {
      source_platform: "youtube_shorts",
      video_id: videoId,
      video_title: metadata.title,
      video_description: metadata.description,
      hashtags: [
        ...metadata.tags.map(t => `#${t.toLowerCase().replace(/\s+/g, "")}`),
        ...extractHashtags(metadata.description),
      ],
      transcript: transcriptionResult.transcript,
      video_length_seconds: parseDuration(metadata.duration),
      channel_name: metadata.channelTitle,
      view_count: parseInt(metadata.viewCount, 10),
      published_at: metadata.publishedAt,
    };

    logStep("Context normalized", { 
      hashtags: normalizedContext.hashtags.length,
      duration: normalizedContext.video_length_seconds 
    });

    // Step 6: Infer intent using AI
    logStep("Inferring creator intent");

    const intentPrompt = `Analyze this YouTube Shorts video content and infer the creator's intent.

VIDEO TITLE: ${normalizedContext.video_title}
VIDEO DESCRIPTION: ${normalizedContext.video_description}
HASHTAGS: ${normalizedContext.hashtags.join(", ")}
CHANNEL: ${normalizedContext.channel_name}

TRANSCRIPT:
${normalizedContext.transcript}

Based on this content, analyze:
1. What is the primary intent? (educate, explain, inspire, sell, entertain)
2. Who is the target audience?
3. What is the overall tone? (educational, casual, bold, story-driven)
4. What is the core message in one sentence?
5. What are 3 key takeaways?

Respond ONLY with valid JSON in this exact format:
{
  "intent": "educate|explain|inspire|sell|entertain",
  "target_audience": "description of target audience",
  "tone": "educational|casual|bold|story-driven",
  "core_message": "one sentence summary of what the video is truly about",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
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
          { 
            role: "system", 
            content: "You are an expert content analyst. Analyze content to understand creator intent, not to rewrite it. Be precise and insightful." 
          },
          { role: "user", content: intentPrompt },
        ],
      }),
    });

    if (!intentResponse.ok) {
      const errorText = await intentResponse.text();
      logStep("Intent inference error", { status: intentResponse.status });
      throw new Error("Failed to analyze video intent");
    }

    const intentData = await intentResponse.json();
    const intentContent = intentData.choices?.[0]?.message?.content;
    
    let intentInference: IntentInference;
    try {
      const cleanedIntent = intentContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      intentInference = JSON.parse(cleanedIntent);
    } catch (parseError) {
      logStep("Failed to parse intent response", { content: intentContent?.substring(0, 100) });
      // Fallback to defaults
      intentInference = {
        intent: "explain",
        target_audience: "general audience",
        tone: "casual",
        core_message: normalizedContext.video_title,
        key_takeaways: ["Key insight from the video"],
      };
    }

    logStep("Intent inferred", { 
      intent: intentInference.intent, 
      audience: intentInference.target_audience 
    });

    // Return the enriched context for content generation
    return new Response(JSON.stringify({
      success: true,
      context: normalizedContext,
      intent: intentInference,
      metadata: {
        videoId,
        title: metadata.title,
        channel: metadata.channelTitle,
        duration: normalizedContext.video_length_seconds,
        views: normalizedContext.view_count,
        transcriptLength: transcriptionResult.transcript.length,
        transcriptConfidence: transcriptionResult.confidence,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: sanitizeForLog(errorMessage) });

    // User-friendly error messages
    let safeMessage = "An error occurred processing the video. Please try again.";
    
    if (errorMessage.includes("not configured")) {
      safeMessage = "Service temporarily unavailable. Please try again later.";
    } else if (errorMessage.includes("not found") || errorMessage.includes("private")) {
      safeMessage = "Video not found or is private. Please check the URL and try again.";
    } else if (errorMessage.includes("Authentication") || errorMessage.includes("authorization")) {
      safeMessage = "Authentication required. Please log in again.";
    } else if (errorMessage.includes("timed out")) {
      safeMessage = "Video processing took too long. Please try a shorter video.";
    } else if (errorMessage.includes("Transcription failed")) {
      safeMessage = "Could not transcribe the video audio. The video may not have clear speech.";
    }

    return new Response(JSON.stringify({ error: safeMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
