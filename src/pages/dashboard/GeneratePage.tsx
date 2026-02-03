import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Video,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Copy,
  BarChart2,
  Lightbulb,
  Zap,
} from "lucide-react";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";

interface DashboardContext {
  profile: UserProfile | null;
}

type Step = 1 | 2 | 3 | 4;
type InputType = "text" | "video";

const steps = [
  { number: 1, name: "Input", icon: FileText },
  { number: 2, name: "Analysis", icon: BarChart2 },
  { number: 3, name: "Improve", icon: Lightbulb },
  { number: 4, name: "Outputs", icon: Zap },
];

const platformTabs = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "reddit", label: "Reddit" },
  { value: "video", label: "Video Scripts" },
];

const GeneratePage = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [inputType, setInputType] = useState<InputType>("text");
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Mock analysis results
  const analysisResults = {
    structureScore: 78,
    clarityScore: 85,
    engagementPotential: 72,
  };

  // Mock suggestions
  const suggestions = [
    "Add a hook in the first line to grab attention",
    "Include a specific example or data point",
    "End with a clear call-to-action",
  ];

  // Mock outputs
  const outputs: Record<string, string> = {
    linkedin: "🚀 Just learned something game-changing about content creation...\n\nThe best posts don't start with polished ideas. They start with raw thoughts.\n\nHere's what I mean:\n\n→ Capture the idea immediately\n→ Don't overthink the format\n→ Let the platform guide the structure\n\nWhat's your process for turning ideas into content?",
    x: "Hot take: The best content comes from raw, unpolished ideas.\n\nStop overthinking. Start posting.\n\nThread 🧵",
    threads: "Real talk about content creation:\n\nYour rough drafts > your perfectionism\n\nEvery great post started as a messy thought. Capture it first, polish it later.\n\nWho else struggles with this?",
    reddit: "**[Discussion] What's your process for turning ideas into content?**\n\nI've been experimenting with capturing raw ideas instead of waiting for \"perfect\" ones. The results have been surprising.\n\nCurious to hear what works for others in this community.",
    video: "**Hook (0-3s):** \"Stop waiting for the perfect idea.\"\n\n**Setup (3-10s):** \"Every great piece of content started as a rough thought. Here's what I do instead of overthinking.\"\n\n**Main Points (10-45s):**\n- Capture ideas immediately\n- Don't worry about format\n- Let the platform guide structure\n\n**CTA (45-60s):** \"Try this with your next idea and let me know what happens.\"",
  };

  const handleCopy = async (platform: string) => {
    await navigator.clipboard.writeText(outputs[platform]);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentStep(2);
    }, 1500);
  };

  const canProceed = () => {
    if (currentStep === 1) return textInput.trim().length > 10 || inputType === "video";
    return true;
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Create Content</h1>
          <p className="text-muted-foreground mt-1">Transform your ideas into platform-ready posts</p>
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
                  className="flex flex-col items-center cursor-pointer"
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
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What would you like to create?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input Type Selection */}
                  <div className="flex gap-3">
                    <Button
                      variant={inputType === "text" ? "default" : "outline"}
                      className="flex-1 h-auto py-4 flex-col gap-2"
                      onClick={() => setInputType("text")}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Text Input</span>
                    </Button>
                    <Button
                      variant={inputType === "video" ? "default" : "outline"}
                      className="flex-1 h-auto py-4 flex-col gap-2"
                      onClick={() => setInputType("video")}
                    >
                      <Video className="h-6 w-6" />
                      <span>Video Upload</span>
                    </Button>
                  </div>

                  {inputType === "text" ? (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Paste your content, idea, or rough draft here. Don't worry about polish – we'll help you refine it..."
                        className="min-h-[200px] resize-none"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        {textInput.length} characters
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Drop your video here</p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                        </div>
                        <Button variant="outline">Choose File</Button>
                      </div>
                    </div>
                  )}

                  {/* Platform Pills */}
                  {profile?.platforms && profile.platforms.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Generating for:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end mt-6">
                <Button
                  variant="hero"
                  size="lg"
                  className="gap-2"
                  disabled={!canProceed() || isAnalyzing}
                  onClick={handleAnalyze}
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Content
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Analysis */}
          {currentStep === 2 && (
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {[
                      { label: "Structure", score: analysisResults.structureScore, description: "Clear intro, body, and conclusion" },
                      { label: "Clarity", score: analysisResults.clarityScore, description: "Easy to understand message" },
                      { label: "Engagement", score: analysisResults.engagementPotential, description: "Likelihood to spark interaction" },
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
                          <span className="text-2xl font-bold text-primary">{item.score}%</span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button variant="hero" size="lg" onClick={() => setCurrentStep(3)}>
                  See Improvements
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Improve */}
          {currentStep === 3 && (
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
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.map((suggestion, index) => (
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
                      <p className="text-foreground">{suggestion}</p>
                    </motion.div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Apply Improvements Automatically
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button variant="hero" size="lg" onClick={() => setCurrentStep(4)}>
                  Generate Outputs
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Outputs */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="linkedin" className="w-full">
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                      {platformTabs.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex-1 min-w-[80px] data-[state=active]:bg-background"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {platformTabs.map((tab) => (
                      <TabsContent key={tab.value} value={tab.value} className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                            {outputs[tab.value]}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(tab.value)}
                            >
                              {copiedPlatform === tab.value ? (
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
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button variant="hero" size="lg" onClick={() => setCurrentStep(1)}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GeneratePage;
