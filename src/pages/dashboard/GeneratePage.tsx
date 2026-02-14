import { useEffect, useMemo, useState, useCallback } from "react";
import { useOutletContext, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Video,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Copy,
  Lightbulb,
  Lock,
  AlertCircle,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { useVideoUsage } from "@/hooks/useVideoUsage";
import { useToast } from "@/hooks/use-toast";
import InsufficientCreditsModal from "@/components/dashboard/InsufficientCreditsModal";
import CreditsIndicator from "@/components/dashboard/CreditsIndicator";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";
import { isValidVideoFile } from "@/lib/video-utils";

interface DashboardContext {
  profile: UserProfile | null;
}

type Step = 1 | 2 | 3 | 4;
type CreationMode = "brief_topic" | "script" | "video_upload";

const AUDIENCE_OPTIONS = ["Students", "Founders", "Professionals", "General audience"];
const INTENT_OPTIONS = ["Explain", "Teach", "Share an opinion", "Tell a story"];
const TONE_OPTIONS = ["Educational", "Casual", "Bold", "Story-driven"];

// Platform logos
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 192 192" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.398c-15.09 0-27.632 6.497-35.302 18.27l13.186 9.045c5.706-8.667 14.468-12.876 26.116-12.876h.282c10.122.062 17.763 3.004 22.705 8.74 3.594 4.174 5.991 9.878 7.18 17.081a83.793 83.793 0 0 0-22.364-2.742c-26.118 0-42.884 13.752-43.643 35.777-.394 11.48 4.23 22.306 13.021 30.475 8.331 7.74 19.205 11.802 30.616 11.426 15.09-.497 26.89-6.258 35.063-17.12 6.21-8.253 10.083-18.815 11.596-31.683 6.937 4.193 12.08 9.743 14.805 16.545 4.612 11.518 4.882 30.46-9.478 44.82-12.613 12.613-27.771 18.087-50.744 18.26-25.476-.192-44.735-8.374-57.26-24.328-11.69-14.89-17.734-36.03-17.963-62.829.229-26.8 6.273-47.94 17.963-62.83C62.527 19.373 81.786 11.19 107.262 11c25.632.192 45.095 8.474 57.848 24.62 6.254 7.914 10.98 17.608 14.08 28.67l15.378-4.148c-3.652-13.02-9.449-24.582-17.298-34.51C161.182 5.846 137.543-3.755 107.158-4h-.208c-30.22.244-53.666 9.83-69.678 28.5C21.778 42.548 14.063 68.147 13.776 99.86v.28c.287 31.712 8.002 57.312 23.496 75.36 16.012 18.67 39.458 28.256 69.678 28.5h.208c27.263-.193 46.696-7.24 63.007-22.815 20.892-19.946 20.04-45.062 13.478-61.463-4.708-11.775-14.015-21.317-26.96-27.738-.054-.027-.11-.05-.146-.068Zm-49.146 55.755c-12.656.417-25.849-4.96-26.163-17.087-.233-9.024 6.39-19.138 28.238-19.138 2.5 0 4.9.127 7.19.364 5.108.529 9.912 1.533 14.366 2.958-1.632 22.597-12.466 32.464-23.631 32.903Z" />
  </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "h-5 w-5"} fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.1-.04 1.86.04 3.73-.04 5.6-.18 4.41-3.1 8.35-7.4 9.05C6.2 23.03 2.55 21 1.05 17.65c-.9-1.99-.87-4.31.17-6.23 1.07-1.96 3.23-3.08 5.44-2.88V12.7c-3.1-.14-5.32 2.62-4.72 5.66.44 2.19 2.5 3.93 4.74 3.79 2.15-.12 4.09-1.85 4.2-4.04.09-2.58-.02-5.16.02-7.74.02-2.73.04-5.46.04-8.19 2.45-3.04 3.25-3.01 5.92-3.02 5.92z" />
  </svg>
);

const PLATFORM_CONFIG = [
  { id: "linkedin", label: "LinkedIn", icon: LinkedInIcon },
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "twitter", label: "Twitter/X", icon: XIcon },
  { id: "x", label: "Twitter/X", icon: XIcon },
  { id: "tiktok", label: "TikTok", icon: TikTokIcon },
  { id: "youtube", label: "YouTube Shorts", icon: YouTubeIcon },
  { id: "threads", label: "Threads", icon: ThreadsIcon },
  { id: "reddit", label: "Reddit", icon: RedditIcon },
];

const TEXT_GENERATION_STAGES = [
  "Analyzing the content",
  "Fine tuning the content",
  "Comparing alternatives",
  "Generating the best style of content",
];


const DEFAULT_PROJECT_TITLE = "Content Library";

// Mock data for video mode demo
const MOCK_VIDEO_ANALYSIS = {
  transcript: `So today I want to talk about something that's been on my mind - the future of AI in content creation. 

A lot of people think AI is going to replace creators, but I see it differently. AI is a tool, like a camera or a microphone. It amplifies what you're already capable of.

Think about it - the best creators aren't just people with the best equipment. They're the ones with unique perspectives, authentic stories, and the ability to connect with their audience.

AI helps with the mechanics - the editing, the optimization, the distribution. But the soul of content? That's always going to be human.

So my advice? Learn to use these tools, but don't lose what makes you unique in the process.`,
  analysis: {
    clarityScore: 82,
    hookStrength: 68,
    engagementScore: 75,
    structureScore: 71,
    strengths: [
      "Strong conversational tone that feels authentic",
      "Good use of rhetorical questions",
      "Clear central message about AI as a tool",
    ],
    improvements: [
      "Open with a stronger hook to grab attention immediately",
      "Add a specific example or statistic to support the argument",
      "End with a more concrete call-to-action",
    ],
  },
  outputs: [
    {
      platform: "linkedin",
      content: `🤖 Hot take: AI won't replace creators. Here's why:

Everyone's worried about AI taking over content creation. But they're missing the bigger picture.

AI is a TOOL, not a replacement.

Like a camera. Like a microphone. It amplifies what you're already capable of.

The best creators aren't the ones with the best equipment. They're the ones with:
→ Unique perspectives
→ Authentic stories  
→ Real human connection

AI handles the mechanics:
• Editing
• Optimization
• Distribution

But the SOUL of content? That's 100% human.

My advice: Master the tools. Keep your authenticity.

What's your take on AI in content creation? 👇`,
    },
    {
      platform: "twitter",
      content: `Hot take: AI won't replace creators.

It's a tool, not a replacement. Like cameras. Like microphones.

The best creators have unique perspectives & authentic stories.

AI handles mechanics. Humans bring soul.

Master the tools. Keep your authenticity. 🧵`,
    },
    {
      platform: "instagram",
      content: `AI won't replace creators 🎯

Here's the truth nobody's talking about...

AI is just a TOOL. Like your camera. Like your microphone.

It amplifies what you already have ✨

The best creators? They're not the ones with fancy equipment.

They're the ones with:
💭 Unique perspectives
📖 Authentic stories
❤️ Real connection

AI = mechanics
You = soul

Learn the tools. Stay authentic.

Drop a 🤖 if you agree!`,
    },
  ],
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

interface OutputVariant {
  id: string;
  label: string;
  analysis: AnalysisResult;
  outputs: PlatformOutput[];
  createdAt: string;
}

type GenerateResponse = {
  analysis: AnalysisResult;
  outputs: PlatformOutput[];
  credits?: {
    used: number;
    limit: number;
    remaining: number;
  };
};



// Upload processing steps
type UploadProcessingStep = "idle" | "uploading" | "transcribing" | "understanding" | "generating" | "complete" | "error";

const UPLOAD_GENERATION_STAGES: Record<UploadProcessingStep, string> = {
  idle: "Preparing upload",
  uploading: "Uploading video",
  transcribing: "Transcribing audio",
  understanding: "Understanding creator intent",
  generating: "Generating platform content",
  complete: "Finalizing results",
  error: "Processing failed",
};

// Upload context types
interface UploadContext {
  source_type: "uploaded_video";
  transcript: string;
  duration_seconds: number;
  word_count: number;
}

interface UploadIntent {
  intent: "educate" | "explain" | "inspire" | "sell" | "entertain";
  target_audience: string;
  tone: "educational" | "casual" | "bold" | "story-driven";
  core_message: string;
  key_takeaways: string[];
  inference_confidence: number;
}

const GeneratePage = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const { user, session } = useAuth();
  const { creditsUsed, creditsLimit, creditsRemaining, updateCreditsAfterGeneration } = useCredits();
  const { plan } = useSubscription();
  const { videoUsed, refreshVideoUsage } = useVideoUsage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const initialProjectId = searchParams.get("projectId");
  const initialText = searchParams.get("text");

  // UI State
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [creationMode, setCreationMode] = useState<CreationMode>("brief_topic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [testingMode, setTestingMode] = useState(false); // Enable testing mode by default
  const [textStageIndex, setTextStageIndex] = useState(0);
  const [outputDetailTab, setOutputDetailTab] = useState<"content" | "analysis" | "improvements">("content");


  // Project selection (required to persist content because of RLS)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
  const [projectOptions, setProjectOptions] = useState<Array<{ id: string; title: string | null }>>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Brief Topic Mode Inputs
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [intent, setIntent] = useState("");
  const [tone, setTone] = useState("");

  // Script Mode Input
  const [scriptText, setScriptText] = useState("");


  // Video Upload Mode Inputs
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProcessingStep, setUploadProcessingStep] = useState<UploadProcessingStep>("idle");
  const [uploadContext, setUploadContext] = useState<UploadContext | null>(null);
  const [uploadIntent, setUploadIntent] = useState<UploadIntent | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState<{ fileName: string; duration: number; wordCount: number; transcriptLength: number; transcriptConfidence: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasXPremium, setHasXPremium] = useState(false);

  // Platforms come from user profile (set during onboarding or in settings) - not selectable here
  const userPlatforms = profile?.platforms || ["linkedin", "twitter"];

  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outputs, setOutputs] = useState<PlatformOutput[]>([]);
  const [outputVariants, setOutputVariants] = useState<OutputVariant[]>([]);
  const [selectedVariantByPlatform, setSelectedVariantByPlatform] = useState<Record<string, string>>({});
  const [hasGeneratedAnother, setHasGeneratedAnother] = useState(false);
  const [variantsSaved, setVariantsSaved] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [autoSavedToLibrary, setAutoSavedToLibrary] = useState(false);

  useEffect(() => {
    // Prefill topic from URL (e.g. converting a note -> generate)
    if (initialText && initialText.trim().length > 0) {
      setCreationMode("brief_topic");
      setTopic(initialText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) {
        setProjectOptions([]);
        return;
      }

      try {
        setProjectsLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select("id, title")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setProjectOptions(data || []);
      } catch (error) {
        console.error("Error loading projects for picker:", error);
        setProjectOptions([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, [user?.id]);

  useEffect(() => {
    // Only used for video upload processing now
  }, [creationMode, currentStep, isProcessing]);

  const selectedProjectLabel = useMemo(() => {
    if (!selectedProjectId) return null;
    const match = projectOptions.find((p) => p.id === selectedProjectId);
    return match?.title || "Untitled Project";
  }, [projectOptions, selectedProjectId]);

  const getOrCreateDefaultProject = useCallback(async () => {
    if (!user?.id) throw new Error("User not authenticated");

    const existingOption = projectOptions.find(
      (project) => (project.title || "").toLowerCase() === DEFAULT_PROJECT_TITLE.toLowerCase()
    );

    if (existingOption) {
      return existingOption;
    }

    const { data: existingDb, error: existingError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("title", DEFAULT_PROJECT_TITLE)
      .limit(1);

    if (existingError) throw existingError;

    if (existingDb && existingDb.length > 0) {
      const fallbackProject = existingDb[0];
      setProjectOptions((prev) => {
        const alreadyListed = prev.some((project) => project.id === fallbackProject.id);
        return alreadyListed ? prev : [fallbackProject, ...prev];
      });
      return fallbackProject;
    }

    const { data: createdProject, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: DEFAULT_PROJECT_TITLE,
        status: "active",
        archived: false,
      })
      .select("id, title")
      .single();

    if (createError) throw createError;

    setProjectOptions((prev) => [createdProject, ...prev]);
    return createdProject;
  }, [projectOptions, user?.id]);

  const normalizedPlan = (plan || profile?.plan || "free").toLowerCase();
  const videoCreditsLimit =
    profile?.monthly_video_limit ?? (normalizedPlan.includes("pro") ? 999 : normalizedPlan.includes("creator") ? 20 : 2);
  const videoCreditsRemaining = Math.max(0, videoCreditsLimit - videoUsed);

  const canProceed = useCallback(() => {
    if (currentStep === 1) {
      if (userPlatforms.length === 0) return false;
      if (creationMode === "brief_topic") return topic.trim().length >= 3;
      if (creationMode === "script") return scriptText.trim().length >= 50;
      if (creationMode === "video_upload") {
        return uploadFile !== null;
      }
    }
    return true;
  }, [currentStep, creationMode, topic, scriptText, userPlatforms.length, uploadFile]);

  const buildOriginalInput = () => {
    if (creationMode === "script") return scriptText.trim();
    if (creationMode === "video_upload") {
      const parts = ["Video upload"];
      if (uploadMetadata?.fileName) parts.push(uploadMetadata.fileName);
      if (uploadIntent?.core_message) parts.push(uploadIntent.core_message);
      return parts.filter(Boolean).join(" - ");
    }
    return topic.trim();
  };

  const persistOutputs = async (
    projectId: string | null,
    payload: { analysis: AnalysisResult; outputs: PlatformOutput[] },
    source: "ai" | "mock" | "video_transcript" = "ai",
  ) => {
    if (!projectId) return;

    const generationId = crypto.randomUUID();

    const score = Math.round(
      (payload.analysis.clarityScore + payload.analysis.hookStrength + payload.analysis.engagementScore + payload.analysis.structureScore) / 4,
    );

    const originalInput = buildOriginalInput();

    const rows = payload.outputs.map((o) => ({
      project_id: projectId,
      generation_id: generationId,
      platform: o.platform,
      content: o.content,
      content_type: "post",
      original_input: originalInput,
      input_type: creationMode,
      analysis_score: score,
      analysis_feedback: JSON.parse(JSON.stringify(payload.analysis)),
      improved_content: null,
      rewrite_count: 0,
      generation_source: source, // Risk 2 Fix: Track content source
    }));

    const { error } = await supabase.from("content_outputs").insert(rows);
    if (error) throw error;
  };

  const autoSaveToLibrary = async (
    payload: { analysis: AnalysisResult; outputs: PlatformOutput[] },
    source: "ai" | "mock" | "video_transcript",
  ) => {
    if (testingMode || selectedProjectId) return;

    try {
      const libraryProject = await getOrCreateDefaultProject();
      await persistOutputs(libraryProject.id, payload, source);
      setAutoSavedToLibrary(true);
      toast({
        title: "Saved to Content Library",
        description: "This generation is now available in your library.",
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast({
        title: "Auto-save failed",
        description: error instanceof Error ? error.message : "Could not save to Content Library.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (copyKey: string, content: string, label: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(copyKey);
    toast({ title: "Copied!", description: `${label} content copied to clipboard` });
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleGenerate = async (append = false) => {
    // Check credits for text generation (skip if testing mode enabled)
    if (!testingMode && creationMode !== "video_upload" && creditsRemaining <= 0) {
      setShowCreditsModal(true);
      return;
    }

    // Testing mode uses mock data
    if (testingMode) {
      setIsProcessing(true);
      setTimeout(() => {
        addOutputVariant({ analysis: MOCK_VIDEO_ANALYSIS.analysis, outputs: MOCK_VIDEO_ANALYSIS.outputs }, append);
        if (!testingMode) {
          autoSaveToLibrary({ analysis: MOCK_VIDEO_ANALYSIS.analysis, outputs: MOCK_VIDEO_ANALYSIS.outputs }, "mock");
        }
        if (!append) {
          setOutputDetailTab("content");
          setCurrentStep(4);
        } else {
          setHasGeneratedAnother(true);
          toast({
            title: "Another version generated",
            description: "Select your preferred version per platform, then save.",
          });
        }
        setIsProcessing(false);
        if (append) {
          setIsAppending(false);
        }
      }, 1500);
      return;
    }



    // Real video upload mode
    if (creationMode === "video_upload" && !testingMode) {
      await handleVideoUploadGeneration(append);
      return;
    }

    // Real text-based generation
    setIsProcessing(true);

    try {
      const generated: GenerateResponse = await (async () => {
        const { data, error } = await supabase.functions.invoke("generate-content", {
          body: {
            mode: creationMode,
            topic: creationMode === "brief_topic" ? topic : undefined,
            audience: creationMode === "brief_topic" ? audience : undefined,
            intent: creationMode === "brief_topic" ? intent : undefined,
            tone: creationMode === "brief_topic" ? tone : undefined,
            script_text: creationMode === "script" ? scriptText : undefined,
            platforms: userPlatforms,
            is_x_premium: hasXPremium,
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (error) throw error;
        if (data.error === "insufficient_credits") {
          setShowCreditsModal(true);
          throw new Error("insufficient_credits");
        }
        if (data.error) throw new Error(data.error);
        return {
          analysis: data.analysis as AnalysisResult,
          outputs: data.outputs as PlatformOutput[],
          credits: data.credits as GenerateResponse["credits"],
        };
      })();

      addOutputVariant({ analysis: generated.analysis, outputs: generated.outputs }, append);
      await autoSaveToLibrary({ analysis: generated.analysis, outputs: generated.outputs }, "ai");

      if (!testingMode && generated.credits?.used !== undefined) {
        updateCreditsAfterGeneration(generated.credits.used);
      }

      if (append) {
        setHasGeneratedAnother(true);
      }
      setOutputDetailTab("content");
      setCurrentStep(4);

      toast({
        title: append ? "Another version generated" : "Content Generated!",
        description: append
          ? "Select your preferred version per platform, then save."
          : `Ready to review. ${testingMode ? "[Testing Mode - No Credits Used]" : `${generated.credits?.remaining ?? creditsRemaining - 1} credits remaining.`}`,
      });
    } catch (error) {
      console.error("Generation error:", error);

      if (error instanceof Error && error.message === "insufficient_credits") {
        return;
      }

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (append) {
        setIsAppending(false);
      }
    }
  };



  // Video Upload Intelligence Mode handler
  const handleVideoUploadGeneration = async (append = false) => {
    if (!uploadFile) {
      toast({ title: "No file selected", description: "Please upload a video file", variant: "destructive" });
      return;
    }

    // Validate file
    const validation = isValidVideoFile(uploadFile);
    if (!validation.valid) {
      toast({ title: "Invalid file", description: validation.error, variant: "destructive" });
      return;
    }

    // Additional size check (50MB for upload mode)
    if (uploadFile.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 50MB", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setUploadProcessingStep("uploading");

    try {
      if (!user?.id || !session?.access_token) throw new Error("Not authenticated");

      // Step 1: Upload to Supabase Storage
      const videoUuid = crypto.randomUUID();
      const ext = uploadFile.name.split(".").pop() || "mp4";
      const storagePath = `${user.id}/${videoUuid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, uploadFile, {
          contentType: uploadFile.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setUploadProcessingStep("transcribing");

      // Step 2: Call process-video edge function
      const { data: videoData, error: videoError } = await supabase.functions.invoke("process-video", {
        body: {
          storagePath,
          fileName: uploadFile.name,
          fileSizeBytes: uploadFile.size,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (videoError) throw videoError;
      if (videoData.error) {
        if (videoData.error === "insufficient_credits") {
          setShowCreditsModal(true);
          throw new Error("insufficient_credits");
        }
        if (videoData.error === "insufficient_spoken_content") {
          toast({
            title: "Insufficient Spoken Content",
            description: videoData.message || "The video doesn't contain enough speech to analyze.",
            variant: "destructive",
          });
          setUploadProcessingStep("error");
          return;
        }
        throw new Error(videoData.error);
      }

      setUploadProcessingStep("understanding");

      // Store context and intent
      const processedContext = videoData.context as UploadContext;
      const processedIntent = videoData.intent as UploadIntent;
      const processedMetadata = videoData.metadata;

      setUploadContext(processedContext);
      setUploadIntent(processedIntent);
      setUploadMetadata(processedMetadata);

      setUploadProcessingStep("generating");

      // Step 3: Generate content using enriched context
      const { data: genData, error: genError } = await supabase.functions.invoke("generate-content", {
        body: {
          mode: "video_upload",
          platforms: userPlatforms,
          upload_context: processedContext,
          upload_intent: processedIntent,
          is_x_premium: hasXPremium,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (genError) throw genError;
      if (genData.error === "insufficient_credits") {
        setShowCreditsModal(true);
        throw new Error("insufficient_credits");
      }
      if (genData.error) throw new Error(genData.error);

      setUploadProcessingStep("complete");

      addOutputVariant({
        analysis: genData.analysis as AnalysisResult,
        outputs: genData.outputs as PlatformOutput[],
      }, append);

      await autoSaveToLibrary({
        analysis: genData.analysis as AnalysisResult,
        outputs: genData.outputs as PlatformOutput[],
      }, "video_transcript");

      if (genData.credits?.used !== undefined) {
        updateCreditsAfterGeneration(genData.credits.used);
      }
      await refreshVideoUsage();

      if (append) {
        setHasGeneratedAnother(true);
      }
      setOutputDetailTab("content");
      setCurrentStep(4);

      toast({
        title: append ? "Another version generated" : "Video Analyzed & Content Generated!",
        description: append
          ? "Select your preferred version per platform, then save."
          : `Transcribed ${processedMetadata.wordCount} words (${Math.round(processedMetadata.duration)}s). ${genData.credits?.remaining ?? creditsRemaining - 1} credits remaining.`,
      });

    } catch (error) {
      console.error("Video upload generation error:", error);
      setUploadProcessingStep("error");

      if (error instanceof Error && error.message === "insufficient_credits") return;

      toast({
        title: "Video Processing Failed",
        description: error instanceof Error ? error.message : "Could not process the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (append) {
        setIsAppending(false);
      }
      setTimeout(() => setUploadProcessingStep("idle"), 3000);
    }
  };

  // File upload validation helper
  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    const validation = isValidVideoFile(file);
    if (!validation.valid) {
      toast({ title: "Invalid file", description: validation.error, variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 50MB", variant: "destructive" });
      return;
    }
    setUploadFile(file);
  };


  const handleSaveSelectedToProject = async () => {
    if (Object.keys(selectedVariantByPlatform).length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one variant per platform.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const resolvedProject = selectedProjectId
        ? { id: selectedProjectId, title: selectedProjectLabel || "your project" }
        : await getOrCreateDefaultProject();

      if (!selectedProjectId) {
        setSelectedProjectId(resolvedProject.id);
      }

      // Get only the selected variants
      const selectedVariants = Object.values(selectedVariantByPlatform);
      const uniqueVariantIds = Array.from(new Set(selectedVariants));

      // Find the variant that appears in selectedVariantByPlatform
      // We need to persist only the selected variant outputs
      for (const variantId of uniqueVariantIds) {
        const variant = outputVariants.find((v) => v.id === variantId);
        if (variant) {
          const sourceType = creationMode === "video_upload"
            ? "video_transcript"
            : testingMode
              ? "mock"
              : "ai";
          await persistOutputs(resolvedProject.id, { analysis: variant.analysis, outputs: variant.outputs }, sourceType);
        }
      }

      setVariantsSaved(true);
      toast({
        title: "Saved to Project",
        description: `Saved ${uniqueVariantIds.length} variant(s) under "${resolvedProject.title || DEFAULT_PROJECT_TITLE}".`,
      });

      // Reset flow after successful save
      setTimeout(() => {
        resetFlow();
      }, 1500);
    } catch (error) {
      console.error("Failed to save variants:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save your selections.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setOutputDetailTab("content");
    setTextStageIndex(0);
    setAnalysis(null);
    setOutputs([]);
    setOutputVariants([]);
    setSelectedVariantByPlatform({});
    setHasGeneratedAnother(false);
    setVariantsSaved(false);
    setAutoSavedToLibrary(false);
    // Reset upload state
    setUploadFile(null);
    setUploadProcessingStep("idle");
    setUploadContext(null);
    setUploadIntent(null);
    setUploadMetadata(null);
    setIsDragging(false);
  };


  const getFilteredOutputs = (variantOutputs: PlatformOutput[]) => {
    return variantOutputs.filter(o =>
      userPlatforms.some(sp =>
        o.platform.toLowerCase().includes(sp.toLowerCase()) ||
        sp.toLowerCase().includes(o.platform.toLowerCase())
      )
    );
  };

  const addOutputVariant = (payload: { analysis: AnalysisResult; outputs: PlatformOutput[] }, append: boolean) => {
    const newId = crypto.randomUUID();
    setAnalysis(payload.analysis);
    setOutputs(payload.outputs);
    setOutputVariants((prev) => {
      const next = append
        ? [...prev, { id: newId, label: `Option ${prev.length + 1}`, analysis: payload.analysis, outputs: payload.outputs, createdAt: new Date().toISOString() }]
        : [{ id: newId, label: "Option 1", analysis: payload.analysis, outputs: payload.outputs, createdAt: new Date().toISOString() }];
      return next;
    });
    setSelectedVariantByPlatform((prev) => {
      const next = { ...prev };
      payload.outputs.forEach((output) => {
        const key = output.platform.toLowerCase();
        if (!next[key]) {
          next[key] = newId;
        }
      });
      return next;
    });
  };

  const getAllPlatforms = () => {
    const platforms = new Map<string, PlatformOutput>();
    outputVariants.forEach((variant) => {
      getFilteredOutputs(variant.outputs).forEach((output) => {
        const key = output.platform.toLowerCase();
        if (!platforms.has(key)) {
          platforms.set(key, output);
        }
      });
    });
    return Array.from(platforms.values());
  };

  const handleGenerateAnother = async () => {
    if (isProcessing) return;
    setIsAppending(true);
    await handleGenerate(true);
  };

  const platformTabs = getAllPlatforms();
  const uploadStageOrder: UploadProcessingStep[] = ["uploading", "transcribing", "understanding", "generating", "complete"];
  const currentUploadStageIndex = Math.max(0, uploadStageOrder.indexOf(uploadProcessingStep));
  const activeStageList = creationMode === "video_upload"
    ? uploadStageOrder.map((stage) => UPLOAD_GENERATION_STAGES[stage])
    : TEXT_GENERATION_STAGES;
  const activeStageIndex = creationMode === "video_upload" ? currentUploadStageIndex
    : textStageIndex;
  const activeStageLabel = creationMode === "video_upload"
    ? UPLOAD_GENERATION_STAGES[uploadProcessingStep]
    : TEXT_GENERATION_STAGES[textStageIndex];
  const activeStageProgress = creationMode === "video_upload"
    ? ((currentUploadStageIndex + 1) / uploadStageOrder.length) * 100
    : ((textStageIndex + 1) / TEXT_GENERATION_STAGES.length) * 100;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header with Credits */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Create Content</h1>
            <p className="text-muted-foreground mt-1">Transform your ideas into platform-ready posts</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <CreditsIndicator
              label={creationMode === "video_upload" ? "Video credits" : "Text credits"}
              used={creationMode === "video_upload" ? videoUsed : undefined}
              limit={creationMode === "video_upload" ? videoCreditsLimit : undefined}
              remaining={creationMode === "video_upload" ? videoCreditsRemaining : undefined}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Mode Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Choose Your Starting Point</CardTitle>
                  <CardDescription>Select how you want to create your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "brief_topic", icon: MessageSquare, label: "Brief Topic", desc: "Start with a simple idea" },
                      { id: "script", icon: FileText, label: "Script", desc: "Improve existing content" },
                      { id: "video_upload", icon: Upload, label: "Upload Video", desc: "Transcribe & generate" },
                    ].map((item) => {
                      const isSelected = creationMode === item.id;
                      return (
                        <div key={item.id} className="relative h-full">
                          {isSelected && (
                            <motion.div
                              layoutId="creation-mode-active"
                              className="absolute inset-0 rounded-md bg-primary shadow-md z-0"
                              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                          )}
                          <Button
                            variant="ghost"
                            className={`relative z-10 h-full w-full py-4 flex-col gap-2 rounded-md transition-all duration-200 ${isSelected
                              ? "text-primary-foreground hover:text-primary-foreground hover:bg-transparent"
                              : "bg-card border border-input shadow-sm hover:border-primary/50 text-foreground"
                              }`}
                            onClick={() => setCreationMode(item.id as CreationMode)}
                          >
                            <div className={`p-2 rounded-full mb-0.5 transition-colors duration-200 ${isSelected
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/10 text-primary"
                              }`}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-base block">{item.label}</span>
                              <span className={`text-xs font-normal block transition-colors duration-200 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                                }`}>
                                {item.desc}
                              </span>
                            </div>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Mode-Specific Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {creationMode === "brief_topic" && "What's Your Topic?"}
                    {creationMode === "script" && "Paste Your Script"}
                    {creationMode === "video_upload" && "Upload Your Video"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  {creationMode === "brief_topic" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic *</Label>
                        <Input
                          id="topic"
                          placeholder="e.g., What is SAP? or The future of remote work"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Target Audience</Label>
                          <Select value={audience} onValueChange={setAudience}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                              {AUDIENCE_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Intent</Label>
                          <Select value={intent} onValueChange={setIntent}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select intent" />
                            </SelectTrigger>
                            <SelectContent>
                              {INTENT_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Tone</Label>
                          <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              {TONE_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {creationMode === "script" && (
                    <div className="space-y-2">
                      <Label htmlFor="script">Your Script (min 50 characters)</Label>
                      <Textarea
                        id="script"
                        placeholder="Paste your existing content, draft, or script here. We'll analyze it and help you improve it for each platform..."
                        className="min-h-[200px] resize-none"
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        {scriptText.length} characters {scriptText.length < 50 && `(need ${50 - scriptText.length} more)`}
                      </p>
                    </div>
                  )}



                  {creationMode === "video_upload" && (
                    <div className="space-y-4">
                      {/* Upload Mode Notice */}
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-start gap-2">
                          <Upload className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-foreground">Video Reference & Upload Intelligence</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Upload your own recording or any reference video. We'll analyze the content to generate an enhanced version, polished scripts, or platform-ready posts inspired by the source.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Drag & Drop Upload Area */}
                      {!uploadFile && (
                        <div
                          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${isDragging
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                            }`}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileSelect(file);
                          }}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "video/mp4,video/quicktime,video/webm";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileSelect(file);
                            };
                            input.click();
                          }}
                        >
                          <motion.div
                            animate={isDragging ? { scale: 1.05, y: -4 } : { scale: 1, y: 0 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {isDragging ? "Drop your video here" : "Drag & drop or click to upload"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                MP4, MOV, or WebM • Max 50MB • Under 2 minutes
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Selected File Preview */}
                      {uploadFile && !isProcessing && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Video className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{uploadFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB • {uploadFile.type.split("/")[1]?.toUpperCase()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUploadFile(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Processing Status */}
                      {isProcessing && uploadProcessingStep !== "idle" && (
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="h-5 w-5 text-primary" />
                            </motion.div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {UPLOAD_GENERATION_STAGES[uploadProcessingStep]}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {uploadProcessingStep === "uploading" && "Securely uploading your video..."}
                                {uploadProcessingStep === "transcribing" && "Transcribing audio (this may take a minute)..."}
                                {uploadProcessingStep === "understanding" && "Analyzing creator intent and tone..."}
                                {uploadProcessingStep === "generating" && "Creating platform-native content..."}
                                {uploadProcessingStep === "complete" && "Done!"}
                                {uploadProcessingStep === "error" && "Something went wrong"}
                              </p>
                            </div>
                          </div>
                          <Progress
                            value={
                              uploadProcessingStep === "uploading" ? 15 :
                                uploadProcessingStep === "transcribing" ? 45 :
                                  uploadProcessingStep === "understanding" ? 70 :
                                    uploadProcessingStep === "generating" ? 90 :
                                      uploadProcessingStep === "complete" ? 100 : 0
                            }
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Upload Result Preview */}
                      {uploadMetadata && uploadIntent && !isProcessing && (
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{uploadMetadata.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(uploadMetadata.duration)}s • {uploadMetadata.wordCount} words transcribed
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <Badge variant="secondary" className="text-xs">
                              Intent: {uploadIntent.intent}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Tone: {uploadIntent.tone}
                            </Badge>
                            {uploadIntent.inference_confidence < 0.6 && (
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                                Low confidence — review intent
                              </Badge>
                            )}
                          </div>
                          {uploadIntent.core_message && (
                            <p className="text-xs text-muted-foreground italic border-t pt-2">
                              "{uploadIntent.core_message}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t space-y-2">
                    <Label>Link to a project (optional)</Label>
                    <Select
                      value={selectedProjectId ?? "__none__"}
                      onValueChange={(v) => {
                        const nextProjectId = v === "__none__" ? null : v;
                        setSelectedProjectId(nextProjectId);
                        if (nextProjectId) {
                          setAutoSavedToLibrary(false);
                        }
                      }}
                      disabled={projectsLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Don't link to a project"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Don't link to a project</SelectItem>
                        {projectOptions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title || "Untitled Project"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      If you don't link a project, we'll save it to your Content Library.
                    </p>
                  </div>

                  {isProcessing && currentStep === 1 && (
                    <div className="absolute inset-0 z-10 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="w-full max-w-md rounded-xl border bg-background/90 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
                          >
                            <Sparkles className="h-4 w-4 text-primary" />
                          </motion.div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{activeStageLabel}</p>
                            <p className="text-xs text-muted-foreground">Hang tight, we are preparing your content.</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="text-xs text-muted-foreground">
                              Please keep this tab open while we work.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Display (from settings - not selectable) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Output Platforms</CardTitle>
                  <CardDescription>
                    Content will be generated for your selected platforms.
                    <Link to="/dashboard/settings?tab=platforms" className="text-primary hover:underline ml-1">
                      Change in settings
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {userPlatforms.length > 0 ? (
                        userPlatforms.map((platformId) => {
                          const platform = PLATFORM_CONFIG.find(p => p.id === platformId);
                          return (
                            <Badge
                              key={platformId}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm flex items-center"
                            >
                              <span className="mr-1.5 flex items-center">
                                {platform?.icon ? <platform.icon className="h-4 w-4" /> : "📝"}
                              </span>
                              {platform?.label || platformId}
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No platforms selected. <a href="/dashboard/settings?tab=platforms" className="text-primary hover:underline">Select platforms</a>
                        </p>
                      )}
                    </div>

                    {userPlatforms.some(p => p === "twitter" || p === "x") && (
                      <div className="flex items-center space-x-2 border-t pt-4">
                        <input
                          type="checkbox"
                          id="x-premium"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={hasXPremium}
                          onChange={(e) => setHasXPremium(e.target.checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="x-premium"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Enable X Premium (25,000 chars)
                          </label>
                          <p className="text-xs text-muted-foreground">
                            If checked, we'll generate longer, detailed posts for X instead of short threads.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="hero"
                  size="lg"
                  className="gap-2"
                  disabled={!canProceed() || isProcessing}
                  onClick={() => handleGenerate(false)}
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.div>
                      {creationMode === "script" ? "Analyzing..." : creationMode === "video_upload" ? "Processing..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      {creationMode === "script" ? "Analyze Script" : creationMode === "video_upload" ? "Upload & Generate" : "Generate Content"}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Analysis */}
          {currentStep === 2 && analysis && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Analysis</CardTitle>
                  <CardDescription>Review the details for this generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {[
                        { label: "Clarity", score: analysis.clarityScore, description: "How easy your message is to understand" },
                        { label: "Hook Strength", score: analysis.hookStrength, description: "How well the opening grabs attention" },
                        { label: "Engagement", score: analysis.engagementScore, description: "Likelihood to spark interaction" },
                        { label: "Structure", score: analysis.structureScore, description: "Logical flow and organization" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-foreground">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <span className={`text-2xl font-bold ${item.score >= 80 ? "text-green-600 dark:text-green-400" :
                              item.score >= 60 ? "text-primary" :
                                "text-amber-600 dark:text-amber-400"
                              }`}>{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </motion.div>
                      ))}
                    </div>

                    {analysis.strengths.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Strengths
                        </p>
                        <ul className="space-y-1.5">
                          {analysis.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={resetFlow}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    setOutputDetailTab("analysis");
                    setCurrentStep(4);
                  }}
                >
                  Back to Outputs
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Improve */}
          {currentStep === 3 && analysis && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Improvements</CardTitle>
                  <CardDescription>Ways to make your content even more impactful</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.improvements.map((improvement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Lightbulb className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-foreground">{improvement}</p>
                    </motion.div>
                  ))}

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Good news!</strong> We've already applied these improvements to your platform-ready outputs. Continue to see the optimized versions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    setOutputDetailTab("improvements");
                    setCurrentStep(4);
                  }}
                >
                  Back to Outputs
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Outputs */}
          {currentStep === 4 && outputVariants.length > 0 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative">
                <CardHeader className="space-y-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">Your Content</CardTitle>
                      <CardDescription>Platform-optimized versions ready to post</CardDescription>
                    </div>
                    {!hasGeneratedAnother && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateAnother}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        {isAppending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {isAppending ? "Generating..." : "Generate Another"}
                      </Button>
                    )}
                  </div>
                  {autoSavedToLibrary && !selectedProjectId && (
                    <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                      Saved to Content Library.
                    </div>
                  )}
                  {outputVariants.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Compare options side by side and pick your favorite per platform.
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Tabs value={outputDetailTab} onValueChange={(value) => setOutputDetailTab(value as "content" | "analysis" | "improvements")}>
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                      <TabsTrigger value="content" className="flex-1 min-w-[90px] data-[state=active]:bg-background">
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="flex-1 min-w-[90px] data-[state=active]:bg-background">
                        Analysis
                      </TabsTrigger>
                      <TabsTrigger value="improvements" className="flex-1 min-w-[120px] data-[state=active]:bg-background">
                        Improvements
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="mt-4">
                      <Tabs defaultValue={platformTabs[0]?.platform.toLowerCase()} className="w-full">
                        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                          {platformTabs.map((platform) => {
                            const platformConfig = PLATFORM_CONFIG.find(
                              p => platform.platform.toLowerCase() === p.id || platform.platform.toLowerCase().includes(p.id)
                            );
                            return (
                              <TabsTrigger
                                key={platform.platform}
                                value={platform.platform.toLowerCase()}
                                className="flex-1 min-w-[80px] data-[state=active]:bg-background gap-2"
                              >
                                {platformConfig?.icon ? (
                                  <platformConfig.icon className="h-4 w-4" />
                                ) : (
                                  <span>📝</span>
                                )}
                                <span className="hidden sm:inline">{platformConfig?.label || platform.platform}</span>
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>

                        {platformTabs.map((platform) => {
                          const platformKey = platform.platform.toLowerCase();
                          return (
                            <TabsContent key={platform.platform} value={platformKey} className="mt-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                {outputVariants.map((variant) => {
                                  const variantOutput = getFilteredOutputs(variant.outputs).find(
                                    (output) => output.platform.toLowerCase() === platformKey
                                  );
                                  if (!variantOutput) return null;

                                  const isSelected = selectedVariantByPlatform[platformKey] === variant.id;
                                  const copyKey = `${platformKey}:${variant.id}`;

                                  return (
                                    <motion.div
                                      key={variant.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`space-y-3 rounded-lg border p-4 ${isSelected ? "border-primary/60 bg-primary/5" : "border-muted"}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">{variant.label}</span>
                                          {isSelected && <Badge variant="default">Selected</Badge>}
                                        </div>
                                        <Button
                                          variant={isSelected ? "default" : "outline"}
                                          size="sm"
                                          onClick={() =>
                                            setSelectedVariantByPlatform((prev) => ({
                                              ...prev,
                                              [platformKey]: variant.id,
                                            }))
                                          }
                                        >
                                          {isSelected ? "Using" : "Use this"}
                                        </Button>
                                      </div>
                                      <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                        {variantOutput.content}
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                          {variantOutput.content.length} characters
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleCopy(copyKey, variantOutput.content, platform.platform)}
                                        >
                                          {copiedPlatform === copyKey ? (
                                            <>
                                              <Check className="h-4 w-4 mr-2" />
                                              Copied!
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-4 w-4 mr-2" />
                                              Copy
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </TabsContent>
                          );
                        })}
                      </Tabs>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-4">
                      {analysis && (
                        <div className="space-y-6">
                          <div className="grid gap-4">
                            {[
                              { label: "Clarity", score: analysis.clarityScore, description: "How easy your message is to understand" },
                              { label: "Hook Strength", score: analysis.hookStrength, description: "How well the opening grabs attention" },
                              { label: "Engagement", score: analysis.engagementScore, description: "Likelihood to spark interaction" },
                              { label: "Structure", score: analysis.structureScore, description: "Logical flow and organization" },
                            ].map((item, index) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="space-y-2"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-foreground">{item.label}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                  </div>
                                  <span className={`text-2xl font-bold ${item.score >= 80 ? "text-green-600 dark:text-green-400" :
                                    item.score >= 60 ? "text-primary" :
                                      "text-amber-600 dark:text-amber-400"
                                    }`}>{item.score}%</span>
                                </div>
                                <Progress value={item.score} className="h-2" />
                              </motion.div>
                            ))}
                          </div>

                          {analysis.strengths.length > 0 && (
                            <div className="space-y-2">
                              <p className="font-medium text-foreground flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                Strengths
                              </p>
                              <ul className="space-y-1.5">
                                {analysis.strengths.map((strength, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="improvements" className="mt-4">
                      {analysis && (
                        <div className="space-y-4">
                          {analysis.improvements.map((improvement, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.08 }}
                              className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                            >
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <p className="text-foreground">{improvement}</p>
                            </motion.div>
                          ))}

                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                              <strong className="text-foreground">Good news!</strong> We've already applied these improvements to your platform-ready outputs. You can post the content as-is or tweak it further.
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                {isProcessing && (
                  <div className="absolute inset-0 z-10 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-xl border bg-background/90 p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{activeStageLabel}</p>
                          <p className="text-xs text-muted-foreground">Hang tight, we are preparing your content.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <div className="text-xs text-muted-foreground">
                            Please keep this tab open while we work.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>



              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {!variantsSaved && (!autoSavedToLibrary || selectedProjectId) && (
                    <>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleSaveSelectedToProject}
                        disabled={isProcessing || Object.keys(selectedVariantByPlatform).length === 0}
                        className="gap-2"
                      >
                        <Check className="h-5 w-5" />
                        {selectedProjectId ? "Save to Project" : "Save to Library"}
                      </Button>
                      <Button variant="outline" onClick={resetFlow}>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create More
                      </Button>
                    </>
                  )}
                  {variantsSaved && (
                    <Button variant="outline" onClick={resetFlow}>
                      <Plus className="h-5 w-5 mr-2" />
                      Create New
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div >

      {/* Insufficient Credits Modal */}
      < InsufficientCreditsModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
        creditsUsed={creditsUsed}
        creditsLimit={creditsLimit}
        currentPlan={plan}
      />
    </div >
  );
};

export default GeneratePage;
