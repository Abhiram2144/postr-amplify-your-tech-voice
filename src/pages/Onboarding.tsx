import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";
import { onboardingSchema, VALID_GOALS, VALID_PLATFORMS, VALID_EXPERIENCE_LEVELS } from "@/lib/validation";

const goals = [
  { value: "build_in_public", label: "Build in public", description: "Share your journey openly" },
  { value: "grow_audience", label: "Grow tech audience", description: "Expand your reach" },
  { value: "repurpose_content", label: "Repurpose content", description: "Maximize existing work" },
  { value: "thought_leadership", label: "Thought leadership", description: "Establish expertise" },
];

const platforms = [
  { value: "linkedin", label: "LinkedIn", color: "bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:border-[#0A66C2]" },
  { value: "x", label: "X", color: "bg-foreground/5 border-foreground/20 hover:border-foreground" },
  { value: "threads", label: "Threads", color: "bg-foreground/5 border-foreground/20 hover:border-foreground" },
  { value: "reddit", label: "Reddit", color: "bg-[#FF4500]/10 border-[#FF4500]/30 hover:border-[#FF4500]" },
  { value: "instagram", label: "Instagram", color: "bg-[#E4405F]/10 border-[#E4405F]/30 hover:border-[#E4405F]" },
  { value: "youtube", label: "YouTube", color: "bg-[#FF0000]/10 border-[#FF0000]/30 hover:border-[#FF0000]" },
  { value: "tiktok", label: "TikTok", color: "bg-foreground/5 border-foreground/20 hover:border-foreground" },
];

const experienceLevels = [
  { value: "student", label: "Student", description: "Learning & exploring" },
  { value: "developer", label: "Developer", description: "Building software" },
  { value: "engineer", label: "Engineer", description: "Solving complex problems" },
  { value: "founder", label: "Founder", description: "Leading a venture" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [primaryGoal, setPrimaryGoal] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxPlatforms = 3; // Free plan limit

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else if (selectedPlatforms.length < maxPlatforms) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      toast({
        title: "Platform limit reached",
        description: `Free plan allows up to ${maxPlatforms} platforms. Upgrade to add more.`,
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    if (step === 1) return primaryGoal !== "";
    if (step === 2) return selectedPlatforms.length > 0;
    if (step === 3) return experienceLevel !== "";
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    // Validate onboarding data before submitting
    const validation = onboardingSchema.safeParse({
      primaryGoal,
      platforms: selectedPlatforms,
      experienceLevel,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          primary_goal: validation.data.primaryGoal,
          platforms: validation.data.platforms,
          experience_level: validation.data.experienceLevel,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Postr!",
        description: "Your profile has been set up successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-primary"
                  : s < step
                  ? "w-2 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="bg-card rounded-2xl border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {step === 1 && "What's your primary goal?"}
              {step === 2 && "Which platforms interest you?"}
              {step === 3 && "What's your experience level?"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {step === 1 && "This helps us personalize your content"}
              {step === 2 && `Select up to ${maxPlatforms} platforms (Free plan)`}
              {step === 3 && "This helps us tune tone and examples"}
            </p>
          </div>

          {/* Step 1: Primary Goal */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setPrimaryGoal(goal.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    primaryGoal === goal.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{goal.label}</p>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    {primaryGoal === goal.value && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Platforms */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => togglePlatform(platform.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPlatforms.includes(platform.value)
                        ? "border-primary bg-primary/5"
                        : `${platform.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{platform.label}</span>
                      {selectedPlatforms.includes(platform.value) && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {selectedPlatforms.length}/{maxPlatforms} selected
              </p>
            </motion.div>
          )}

          {/* Step 3: Experience Level */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperienceLevel(level.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    experienceLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    {experienceLevel === level.value && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(step - 1)}
              className={`text-sm text-muted-foreground hover:text-foreground ${
                step === 1 ? "invisible" : ""
              }`}
            >
              Back
            </button>
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {step === 3 ? (isSubmitting ? "Saving..." : "Get Started") : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
