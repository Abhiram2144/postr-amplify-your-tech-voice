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

const PlatformLogo = ({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) => {
  switch (platform) {
    case "linkedin":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.5 23.5h4V7.5h-4v16Zm7.5-16h3.8v2.2h.05c.53-1 1.84-2.2 3.78-2.2 4.04 0 4.78 2.66 4.78 6.12v9.88h-4V14.7c0-2.1-.04-4.8-2.92-4.8-2.93 0-3.38 2.29-3.38 4.65v8.95h-4v-16Z" />
        </svg>
      );
    case "x":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M18.9 2H22l-6.9 7.9L23.1 22h-6.5l-5.1-6.7L5.7 22H2.5l7.4-8.5L1.3 2h6.7l4.6 6.1L18.9 2Zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20Z" />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 192 192" className="h-5 w-5" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.398c-15.09 0-27.632 6.497-35.302 18.27l13.186 9.045c5.706-8.667 14.468-12.876 26.116-12.876h.282c10.122.062 17.763 3.004 22.705 8.74 3.594 4.174 5.991 9.878 7.18 17.081a83.793 83.793 0 0 0-22.364-2.742c-26.118 0-42.884 13.752-43.643 35.777-.394 11.48 4.23 22.306 13.021 30.475 8.331 7.74 19.205 11.802 30.616 11.426 15.09-.497 26.89-6.258 35.063-17.12 6.21-8.253 10.083-18.815 11.596-31.683 6.937 4.193 12.08 9.743 14.805 16.545 4.612 11.518 4.882 30.46-9.478 44.82-12.613 12.613-27.771 18.087-50.744 18.26-25.476-.192-44.735-8.374-57.26-24.328-11.69-14.89-17.734-36.03-17.963-62.829.229-26.8 6.273-47.94 17.963-62.83C62.527 19.373 81.786 11.19 107.262 11c25.632.192 45.095 8.474 57.848 24.62 6.254 7.914 10.98 17.608 14.08 28.67l15.378-4.148c-3.652-13.02-9.449-24.582-17.298-34.51C161.182 5.846 137.543-3.755 107.158-4h-.208c-30.22.244-53.666 9.83-69.678 28.5C21.778 42.548 14.063 68.147 13.776 99.86v.28c.287 31.712 8.002 57.312 23.496 75.36 16.012 18.67 39.458 28.256 69.678 28.5h.208c27.263-.193 46.696-7.24 63.007-22.815 20.892-19.946 20.04-45.062 13.478-61.463-4.708-11.775-14.015-21.317-26.96-27.738-.054-.027-.11-.05-.146-.068Zm-49.146 55.755c-12.656.417-25.849-4.96-26.163-17.087-.233-9.024 6.39-19.138 28.238-19.138 2.5 0 4.9.127 7.19.364 5.108.529 9.912 1.533 14.366 2.958-1.632 22.597-12.466 32.464-23.631 32.903Z" />
  </svg>
      );
    case "reddit":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M14.9 2.6a1.6 1.6 0 0 0-1.9 1.2l-.8 3.5c-2.4.1-4.6.8-6.2 1.8a2.2 2.2 0 1 0-1.2 4c.2 3.6 3.9 6.4 8.2 6.4 4.3 0 8-2.8 8.2-6.4a2.2 2.2 0 1 0-1.5-4.1c-1.7-1-3.9-1.7-6.4-1.8l.7-3.1 2.2.5a1.5 1.5 0 1 0 .4-1.3l-2.7-.7Zm-6 12.4c-.7 0-1.2-.5-1.2-1.2 0-.6.5-1.2 1.2-1.2s1.2.5 1.2 1.2c0 .7-.5 1.2-1.2 1.2Zm6.2 0c-.7 0-1.2-.5-1.2-1.2 0-.6.5-1.2 1.2-1.2.6 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2Zm-6 1.9c1.1 1 3.7 1 4.8 0l1.2 1.2c-1.8 1.6-5.4 1.6-7.2 0l1.2-1.2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Zm10 2H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5Zm-5 3A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.25-2.35a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.6 31.6 0 0 0 2 12c0 1.6.1 3.2.4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.3-1.6.4-3.2.4-4.8 0-1.6-.1-3.2-.4-4.8ZM10.1 15.3V8.7l6 3.3-6 3.3Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M14 2h2.2c.3 2.2 1.8 3.9 4 4.3V8.5c-1.6-.1-3.2-.7-4.2-1.7v7.6c0 3-2.4 5.6-5.6 5.6S5 17.5 5 14.4c0-3 2.4-5.6 5.6-5.6.4 0 .8 0 1.2.1v2.4c-.4-.2-.8-.3-1.2-.3-1.7 0-3.1 1.4-3.1 3.1 0 1.8 1.4 3.1 3.1 3.1 1.8 0 3.2-1.3 3.2-3.6V2Z" />
        </svg>
      );
    default:
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2.5A9.5 9.5 0 1 0 21.5 12 9.5 9.5 0 0 0 12 2.5Zm0 17A7.5 7.5 0 1 1 19.5 12 7.5 7.5 0 0 1 12 19.5Z" />
        </svg>
      );
  }
};

const goals = [
  { value: "build_in_public", label: "Build in public", description: "Share your journey openly" },
  { value: "grow_audience", label: "Grow tech audience", description: "Expand your reach" },
  { value: "repurpose_content", label: "Repurpose content", description: "Maximize existing work" },
  { value: "thought_leadership", label: "Thought leadership", description: "Establish expertise" },
];

const platforms = [
  {
    value: "linkedin",
    label: "LinkedIn",
    color: "bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:border-[#0A66C2]",
    iconColor: "text-[#0A66C2]",
  },
  {
    value: "x",
    label: "X",
    color: "bg-foreground/5 border-foreground/20 hover:border-foreground",
    iconColor: "text-foreground",
  },
  {
    value: "threads",
    label: "Threads",
    color: "bg-foreground/5 border-foreground/20 hover:border-foreground",
    iconColor: "text-foreground",
  },
  {
    value: "reddit",
    label: "Reddit",
    color: "bg-[#FF4500]/10 border-[#FF4500]/30 hover:border-[#FF4500]",
    iconColor: "text-[#FF4500]",
  },
  {
    value: "instagram",
    label: "Instagram",
    color: "bg-[#E4405F]/10 border-[#E4405F]/30 hover:border-[#E4405F]",
    iconColor: "text-[#E4405F]",
  },
  {
    value: "youtube",
    label: "YouTube",
    color: "bg-[#FF0000]/10 border-[#FF0000]/30 hover:border-[#FF0000]",
    iconColor: "text-[#FF0000]",
  },
  {
    value: "tiktok",
    label: "TikTok",
    color: "bg-foreground/5 border-foreground/20 hover:border-foreground",
    iconColor: "text-foreground",
  },
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
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background/60 ${
                            platform.iconColor ?? "text-foreground"
                          }`}
                        >
                          <PlatformLogo platform={platform.value} className="h-5 w-5" />
                        </span>
                        <span className="font-medium">{platform.label}</span>
                      </div>
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
