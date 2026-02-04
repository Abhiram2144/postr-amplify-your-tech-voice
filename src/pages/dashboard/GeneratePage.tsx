import { useEffect, useMemo, useState, useCallback } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
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
  BarChart2,
  Lightbulb,
  Zap,
  Lock,
  AlertCircle,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import InsufficientCreditsModal from "@/components/dashboard/InsufficientCreditsModal";
import CreditsIndicator from "@/components/dashboard/CreditsIndicator";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";

interface DashboardContext {
  profile: UserProfile | null;
}

type Step = 1 | 2 | 3 | 4;
type CreationMode = "brief_topic" | "script" | "video";

const steps = [
  { number: 1, name: "Input", icon: FileText },
  { number: 2, name: "Analysis", icon: BarChart2 },
  { number: 3, name: "Improve", icon: Lightbulb },
  { number: 4, name: "Outputs", icon: Zap },
];

const AUDIENCE_OPTIONS = ["Students", "Founders", "Professionals", "General audience"];
const INTENT_OPTIONS = ["Explain", "Teach", "Share an opinion", "Tell a story"];
const TONE_OPTIONS = ["Educational", "Casual", "Bold", "Story-driven"];

const PLATFORM_CONFIG = [
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "twitter", label: "Twitter/X", icon: "🐦" },
  { id: "youtube", label: "YouTube Shorts", icon: "🎬" },
  { id: "threads", label: "Threads", icon: "🧵" },
  { id: "reddit", label: "Reddit", icon: "🤖" },
];

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

const GeneratePage = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const { user, session } = useAuth();
  const { creditsUsed, creditsLimit, creditsRemaining, updateCreditsAfterGeneration } = useCredits();
  const { plan } = useSubscription();
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
  const [testingMode, setTestingMode] = useState(true); // Enable testing mode by default


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
  
  // Platforms come from user profile (set during onboarding or in settings) - not selectable here
  const userPlatforms = profile?.platforms || ["linkedin", "twitter"];
  
  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outputs, setOutputs] = useState<PlatformOutput[]>([]);
  const [outputVariants, setOutputVariants] = useState<OutputVariant[]>([]);
  const [selectedVariantByPlatform, setSelectedVariantByPlatform] = useState<Record<string, string>>({});
  const [hasGeneratedAnother, setHasGeneratedAnother] = useState(false);
  const [variantsSaved, setVariantsSaved] = useState(false);

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

  const selectedProjectLabel = useMemo(() => {
    if (!selectedProjectId) return null;
    const match = projectOptions.find((p) => p.id === selectedProjectId);
    return match?.title || "Untitled Project";
  }, [projectOptions, selectedProjectId]);

  const normalizedPlan = (plan || profile?.plan || "free").toLowerCase();
  const videoCreditsLimit =
    profile?.monthly_video_limit ?? (normalizedPlan.includes("pro") ? 999 : normalizedPlan.includes("creator") ? 20 : 2);
  const videoCreditsUsed = 0;
  const videoCreditsRemaining = Math.max(0, videoCreditsLimit - videoCreditsUsed);

  const canProceed = useCallback(() => {
    if (currentStep === 1) {
      if (userPlatforms.length === 0) return false;
      if (creationMode === "brief_topic") return topic.trim().length >= 3;
      if (creationMode === "script") return scriptText.trim().length >= 50;
      if (creationMode === "video") return true; // Mock mode
    }
    return true;
  }, [currentStep, creationMode, topic, scriptText, userPlatforms.length]);

  const persistOutputs = async (projectId: string | null, payload: { analysis: AnalysisResult; outputs: PlatformOutput[] }, source: 'ai' | 'mock' | 'video_transcript' = 'ai') => {
    if (!projectId) return;

    const generationId = crypto.randomUUID();

    const score = Math.round(
      (payload.analysis.clarityScore + payload.analysis.hookStrength + payload.analysis.engagementScore + payload.analysis.structureScore) / 4,
    );

    const originalInput = creationMode === "script" ? scriptText.trim() : topic.trim();

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

  const handleCopy = async (copyKey: string, content: string, label: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(copyKey);
    toast({ title: "Copied!", description: `${label} content copied to clipboard` });
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleGenerate = async (append = false) => {
    // Check credits for text generation (skip if testing mode enabled)
    if (!testingMode && creationMode !== "video" && creditsRemaining <= 0) {
      setShowCreditsModal(true);
      return;
    }

    // Testing mode or video mode uses mock data
    if (testingMode || creationMode === "video") {
      setIsProcessing(true);
      setTimeout(() => {
        addOutputVariant({ analysis: MOCK_VIDEO_ANALYSIS.analysis, outputs: MOCK_VIDEO_ANALYSIS.outputs }, append);
        if (!append) {
          setCurrentStep(2);
        } else {
          setHasGeneratedAnother(true);
          toast({
            title: "Another version generated",
            description: "Select your preferred version per platform, then save.",
          });
        }
        setIsProcessing(false);
      }, 1500);
      return;
    }

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

      // Don't auto-persist - user will click "Save to Project" button
      // Just add to output variants for comparison
      addOutputVariant({ analysis: generated.analysis, outputs: generated.outputs }, append);
      
      // Update credits in hook (only if not in testing mode)
      if (!testingMode && generated.credits?.used !== undefined) {
        updateCreditsAfterGeneration(generated.credits.used);
      }
      
      if (append) {
        setHasGeneratedAnother(true);
      }
      
      setCurrentStep(append ? 4 : 2);
      
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
    }
  };

  const handleSaveSelectedToProject = async () => {
    if (!selectedProjectId) {
      toast({
        title: "No Project Selected",
        description: "Please select a project from the dropdown above to save your content.",
        variant: "destructive",
      });
      return;
    }

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
      // Get only the selected variants
      const selectedVariants = Object.values(selectedVariantByPlatform);
      const uniqueVariantIds = Array.from(new Set(selectedVariants));

      // Find the variant that appears in selectedVariantByPlatform
      // We need to persist only the selected variant outputs
      for (const variantId of uniqueVariantIds) {
        const variant = outputVariants.find((v) => v.id === variantId);
        if (variant) {
          await persistOutputs(selectedProjectId, { analysis: variant.analysis, outputs: variant.outputs }, testingMode ? "mock" : "ai");
        }
      }

      setVariantsSaved(true);
      toast({
        title: "Saved to Project",
        description: `Saved ${uniqueVariantIds.length} variant(s) under "${selectedProjectLabel || "your project"}".`,
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
    setAnalysis(null);
    setOutputs([]);
    setOutputVariants([]);
    setSelectedVariantByPlatform({});
    setHasGeneratedAnother(false);
    setVariantsSaved(false);
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
    await handleGenerate(true);
  };

  const platformTabs = getAllPlatforms();

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
            {testingMode && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Testing Mode
              </Badge>
            )}
            <CreditsIndicator
              label={creationMode === "video" ? "Video credits" : "Text credits"}
              used={creationMode === "video" ? videoCreditsUsed : undefined}
              limit={creationMode === "video" ? videoCreditsLimit : undefined}
              remaining={creationMode === "video" ? videoCreditsRemaining : undefined}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestingMode(!testingMode)}
              title={testingMode ? "Switch to real credits" : "Switch to testing mode"}
            >
              {testingMode ? "Disable Testing" : "Enable Testing"}
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          <motion.div
            className="absolute top-5 left-0 h-0.5 bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${isCompleted ? "cursor-pointer" : ""}`}
                  onClick={() => isCompleted && setCurrentStep(step.number as Step)}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted || isActive ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    }}
                    transition={{ duration: 0.2 }}
                    className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${
                      isCompleted || isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </motion.div>
                  <span className={`text-sm mt-2 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant={creationMode === "brief_topic" ? "default" : "outline"}
                      className="h-auto py-4 flex-col gap-2 relative"
                      onClick={() => setCreationMode("brief_topic")}
                    >
                      <MessageSquare className="h-6 w-6" />
                      <span className="font-medium">Brief Topic</span>
                      <span className="text-xs opacity-70">Start with an idea</span>
                    </Button>
                    <Button
                      variant={creationMode === "script" ? "default" : "outline"}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setCreationMode("script")}
                    >
                      <FileText className="h-6 w-6" />
                      <span className="font-medium">Script</span>
                      <span className="text-xs opacity-70">Improve existing content</span>
                    </Button>
                    <Button
                      variant={creationMode === "video" ? "default" : "outline"}
                      className="h-auto py-4 flex-col gap-2 relative"
                      onClick={() => setCreationMode("video")}
                    >
                      <Video className="h-6 w-6" />
                      <span className="font-medium">Video</span>
                      <span className="text-xs opacity-70">Demo mode</span>
                      <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px]">
                        Preview
                      </Badge>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mode-Specific Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {creationMode === "brief_topic" && "What's Your Topic?"}
                    {creationMode === "script" && "Paste Your Script"}
                    {creationMode === "video" && "Upload Video"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {creationMode === "video" && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center bg-muted/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-transparent flex items-center justify-center z-0" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-background border border-muted flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Drop your video here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </div>
                          <Lock className="h-5 w-5 text-muted-foreground absolute top-4 right-4" />
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">Demo Mode Active</p>
                            <p className="text-sm text-muted-foreground">
                              Click "Generate" to see a preview of how video analysis will work. We'll show a sample transcript, analysis, and platform-ready outputs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t space-y-2">
                    <Label>Link to a project (optional)</Label>
                    <Select
                      value={selectedProjectId ?? "__none__"}
                      onValueChange={(v) => setSelectedProjectId(v === "__none__" ? null : v)}
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
                      Link a project if you want this generation to appear in Projects and History.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Display (from settings - not selectable) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Output Platforms</CardTitle>
                  <CardDescription>
                    Content will be generated for your selected platforms. 
                    <a href="/dashboard/settings?tab=platforms" className="text-primary hover:underline ml-1">
                      Change in settings
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userPlatforms.length > 0 ? (
                      userPlatforms.map((platformId) => {
                        const platform = PLATFORM_CONFIG.find(p => p.id === platformId);
                        return (
                          <Badge
                            key={platformId}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm"
                          >
                            <span className="mr-1.5">{platform?.icon || "📝"}</span>
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
                      {creationMode === "script" ? "Analyzing..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      {creationMode === "script" ? "Analyze Script" : "Generate Content"}
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
                  <CardDescription>Here's how your content scores across key metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                          <span className={`text-2xl font-bold ${
                            item.score >= 80 ? "text-green-600 dark:text-green-400" :
                            item.score >= 60 ? "text-primary" :
                            "text-amber-600 dark:text-amber-400"
                          }`}>{item.score}%</span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Strengths */}
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
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={resetFlow}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button variant="hero" size="lg" onClick={() => setCurrentStep(3)}>
                  See Improvements
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
                <Button variant="hero" size="lg" onClick={() => setCurrentStep(4)}>
                  View Outputs
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
              <Card>
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
                        <Sparkles className="h-4 w-4" />
                        Generate Another
                      </Button>
                    )}
                  </div>
                  {outputVariants.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Compare options side by side and pick your favorite per platform.
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={platformTabs[0]?.platform.toLowerCase()} className="w-full">
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                      {platformTabs.map((platform) => {
                        const platformConfig = PLATFORM_CONFIG.find(
                          p => platform.platform.toLowerCase().includes(p.id) || p.id.includes(platform.platform.toLowerCase())
                        );
                        return (
                          <TabsTrigger
                            key={platform.platform}
                            value={platform.platform.toLowerCase()}
                            className="flex-1 min-w-[80px] data-[state=active]:bg-background gap-1"
                          >
                            <span>{platformConfig?.icon || "📝"}</span>
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
                </CardContent>
              </Card>

              {creationMode === "video" && (
                <Card className="mt-4 border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">Demo Transcript Used</p>
                        <p className="text-sm text-muted-foreground">
                          This output was generated from a sample transcript. When video upload is available, you'll get personalized content based on your actual video.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {!variantsSaved && (
                    <>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleSaveSelectedToProject}
                        disabled={isProcessing || Object.keys(selectedVariantByPlatform).length === 0}
                        className="gap-2"
                      >
                        <Check className="h-5 w-5" />
                        Save to Project
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
      </motion.div>

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
        creditsUsed={creditsUsed}
        creditsLimit={creditsLimit}
        currentPlan={plan}
      />
    </div>
  );
};

export default GeneratePage;
