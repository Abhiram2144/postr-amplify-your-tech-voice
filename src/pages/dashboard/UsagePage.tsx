import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Video,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";
import { STRIPE_PLANS, PlanType } from "@/lib/stripe-config";
import { useSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";

interface DashboardContext {
  profile: UserProfile | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

const UsagePage = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const { plan: subscriptionPlan } = useSubscription();
  const { creditsUsed, creditsLimit, creditsRemaining, loading: creditsLoading } = useCredits();

  const normalizePlan = (value?: string | null): PlanType => {
    const normalized = (value ?? "").toLowerCase();
    if (normalized.includes("pro")) return "pro";
    if (normalized.includes("creator")) return "creator";
    return "free";
  };

  const profilePlan = normalizePlan(profile?.plan);
  const effectivePlan = subscriptionPlan !== "free" ? subscriptionPlan : profilePlan;
  const planConfig = STRIPE_PLANS[effectivePlan];

  const generationsLimit = planConfig.limits.ideasPerMonth as number | "unlimited";
  const videosLimit = planConfig.limits.videosPerMonth as number | "unlimited";

  const effectiveTextLimit = typeof generationsLimit === "number" ? creditsLimit : creditsLimit;
  const effectiveTextUsed = creditsLoading ? 0 : creditsUsed;
  const effectiveTextRemaining = creditsLoading ? 0 : creditsRemaining;

  const generationsUsed = effectiveTextUsed;
  const generationsLeftLabel = generationsLimit === "unlimited" ? "Unlimited" : effectiveTextRemaining;

  const effectiveVideoLimit = typeof videosLimit === "number" ? videosLimit : (profile?.monthly_video_limit ?? 0);
  const videosUsed = 0;
  const videosLeftLabel = videosLimit === "unlimited" ? "Unlimited" : (profile?.monthly_video_limit ?? effectiveVideoLimit);

  const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
  const generationsPercent =
    typeof generationsLimit === "number" && effectiveTextLimit > 0 ? clampPercent((generationsUsed / effectiveTextLimit) * 100) : 100;
  const videosPercent =
    typeof videosLimit === "number" && effectiveVideoLimit > 0 ? clampPercent((videosUsed / effectiveVideoLimit) * 100) : 100;

  const formatLimit = (value: number | "unlimited") => (value === "unlimited" ? "Unlimited" : value);
  const generationsLimitLabel = generationsLimit === "unlimited" ? formatLimit(generationsLimit) : effectiveTextLimit;
  const videosLimitLabel = videosLimit === "unlimited" ? formatLimit(videosLimit) : effectiveVideoLimit;

  const planStyles = {
    free: {
      card: "bg-muted/30 border-muted",
      badge: "bg-muted text-muted-foreground",
      icon: "text-muted-foreground",
    },
    creator: {
      card: "bg-gradient-to-br from-accent/15 via-background to-primary/10 border-accent/30",
      badge: "bg-accent/20 text-accent",
      icon: "text-accent",
    },
    pro: {
      card: "bg-gradient-to-br from-primary/20 via-background to-accent/10 border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.15)]",
      badge: "bg-primary/20 text-primary",
      icon: "text-primary",
    },
  } as const;

  const getPlanFeatures = () => {
    const ideasLabel = formatLimit(generationsLimit);
    const videosLabel = formatLimit(videosLimit);
    const platformsLabel =
      planConfig.limits.platforms === "all"
        ? "All platforms unlocked"
        : `${planConfig.limits.platforms} platforms`;
    const supportLabel =
      effectivePlan === "pro"
        ? "Priority processing"
        : effectivePlan === "creator"
        ? "Email support"
        : "Community support";

    return [`${ideasLabel} text generations/month`, `${videosLabel} video analyses/month`, platformsLabel, supportLabel];
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Usage</h1>
          <p className="text-muted-foreground mt-1">Track your content creation activity</p>
        </motion.div>

        {/* Current Plan */}
        <motion.div variants={itemVariants}>
          <Card className={`${planStyles[effectivePlan].card}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className={`h-7 w-7 ${planStyles[effectivePlan].icon}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-foreground capitalize">
                        {STRIPE_PLANS[effectivePlan].name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${planStyles[effectivePlan].badge}`}>
                        {effectivePlan.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {effectivePlan !== "pro" && (
                  <Button variant="hero" className="gap-2" onClick={() => navigate("/pricing")}>
                    <Sparkles className="h-4 w-4" />
                    Upgrade Plan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Stats */}
        <motion.div variants={itemVariants} className="grid gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Text Generations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-foreground">{generationsUsed}</p>
                  <p className="text-sm text-muted-foreground">of {generationsLimitLabel} used this month</p>
                </div>
                <p className="text-lg font-medium text-primary">
                  {generationsLeftLabel} left
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={generationsPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{generationsLimitLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-accent" />
                Video Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-foreground">{videosUsed}</p>
                  <p className="text-sm text-muted-foreground">of {videosLimitLabel} used this month</p>
                </div>
                <p className="text-lg font-medium text-accent">
                  {videosLeftLabel} left
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={videosPercent} className="h-3 [&>div]:bg-accent" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{videosLimitLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Features */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Plan Includes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {getPlanFeatures().map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upgrade CTA for Free/Creator users */}
        {effectivePlan !== "pro" && (
          <motion.div variants={itemVariants}>
            <Card className="bg-muted/50 border-0">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You're using Postr on {STRIPE_PLANS[effectivePlan].name}. Upgrade to unlock more platforms and generations.
                </p>
                <Button variant="outline" onClick={() => navigate("/pricing")}>
                  Compare Plans
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UsagePage;
