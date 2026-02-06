import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Sparkles,
  FileText,
  Video,
  Lightbulb,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_PLANS, PlanType } from "@/lib/stripe-config";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";
import CheckoutSuccessModal from "@/components/dashboard/CheckoutSuccessModal";
import { useProjects } from "@/hooks/useProjects";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";

interface DashboardContext {
  profile: UserProfile | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

const DashboardOverview = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { plan, checkSubscription } = useSubscription();
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const { projects, loading: projectsLoading } = useProjects();
  const { creditsUsed, creditsLimit, creditsRemaining, loading: creditsLoading } = useCredits();

  // Check for checkout success param
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setShowCheckoutSuccess(true);
      // Remove the query param
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
      // Refresh subscription status
      checkSubscription();
    }
  }, [searchParams, setSearchParams, checkSubscription]);

  const normalizePlan = (value?: string | null): PlanType => {
    const normalized = (value ?? "").toLowerCase();
    if (normalized.includes("pro")) return "pro";
    if (normalized.includes("creator")) return "creator";
    return "free";
  };

  const subscriptionPlan = normalizePlan(plan);
  const profilePlan = normalizePlan(profile?.plan);
  const effectivePlan = subscriptionPlan !== "free" ? subscriptionPlan : profilePlan;

  const planConfig = STRIPE_PLANS[effectivePlan];
  const generationsTotal = planConfig.limits.ideasPerMonth as number | "unlimited";
  const videosTotal = planConfig.limits.videosPerMonth as number | "unlimited";

  const formatLimit = (value: number | "unlimited") => (value === "unlimited" ? "Unlimited" : value);

  const effectiveTextLimit = creditsLoading ? (typeof generationsTotal === "number" ? generationsTotal : creditsLimit) : creditsLimit;
  const effectiveTextUsed = creditsLoading ? 0 : creditsUsed;
  const effectiveTextRemaining = creditsLoading ? 0 : creditsRemaining;
  const generationsPercent = effectiveTextLimit > 0 ? Math.min(100, Math.max(0, (effectiveTextRemaining / effectiveTextLimit) * 100)) : 0;

  const effectiveVideoLimit = typeof videosTotal === "number" ? videosTotal : (profile?.monthly_video_limit ?? 0);
  const effectiveVideoRemaining = profile?.monthly_video_limit ?? effectiveVideoLimit;
  const videosPercent = effectiveVideoLimit > 0 ? Math.min(100, Math.max(0, (effectiveVideoRemaining / effectiveVideoLimit) * 100)) : 0;

  const generationsRemainingLabel = generationsTotal === "unlimited" ? "Unlimited" : effectiveTextRemaining;
  const videosRemainingLabel = videosTotal === "unlimited" ? "Unlimited" : effectiveVideoRemaining;

  const recentProjects = projects.slice(0, 4).map((p) => ({
    id: p.id,
    title: p.title || "Untitled Project",
    type: p.input_type || "text",
    date: p.updated_at ? format(new Date(p.updated_at), "MMM d, yyyy") : "",
  }));

  const tips = [
    "Tip: Paste a LinkedIn post to instantly adapt it for X and Threads.",
    "Try uploading a short video clip to generate platform-ready captions.",
    "Your best posts often come from raw, unpolished ideas. Just start!",
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <>
      {/* Checkout Success Modal */}
      <CheckoutSuccessModal 
        open={showCheckoutSuccess} 
        onClose={() => setShowCheckoutSuccess(false)} 
      />
      
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to turn an idea into content?
          </p>
        </motion.div>

        {/* Primary CTA Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(264,100%,65%,0.1),transparent_50%)]" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                  className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"
                >
                  <Sparkles className="h-10 w-10 text-primary" />
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Start Creating
                  </h2>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Transform your ideas into engaging posts for all your platforms in seconds.
                  </p>
                  <Button
                    variant="hero"
                    size="lg"
                    className="gap-2"
                    onClick={() => navigate("/dashboard/generate")}
                  >
                    <Plus className="h-5 w-5" />
                    New Idea
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="group hover:border-primary/30 transition-colors duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {generationsRemainingLabel}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {generationsTotal === "unlimited" ? formatLimit(generationsTotal) : effectiveTextLimit}</span>
                </div>
                <p className="text-sm text-muted-foreground">Generations left</p>
              </div>
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${generationsPercent}%, hsl(var(--muted)) 0)`
                  }}
                />
                <div className="absolute inset-[6px] rounded-full bg-background shadow-inner" />
                <div
                  className="absolute inset-0 rounded-full blur-[6px] opacity-40"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${generationsPercent}%, transparent 0)`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                  {generationsTotal === "unlimited" ? "∞" : `${Math.round(generationsPercent)}%`}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-accent/30 transition-colors duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Video className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {videosRemainingLabel}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {videosTotal === "unlimited" ? formatLimit(videosTotal) : effectiveVideoLimit}</span>
                </div>
                <p className="text-sm text-muted-foreground">Videos left</p>
              </div>
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(hsl(var(--accent)) ${videosPercent}%, hsl(var(--muted)) 0)`
                  }}
                />
                <div className="absolute inset-[6px] rounded-full bg-background shadow-inner" />
                <div
                  className="absolute inset-0 rounded-full blur-[6px] opacity-40"
                  style={{
                    background: `conic-gradient(hsl(var(--accent)) ${videosPercent}%, transparent 0)`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                  {videosTotal === "unlimited" ? "∞" : `${Math.round(videosPercent)}%`}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Projects */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
            {recentProjects.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/projects")}>
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {recentProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4"
                >
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                <p className="text-muted-foreground mb-4">
                  Every great piece of content starts with a simple idea.
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate("/dashboard/projects")}
                >
                  <Plus className="h-4 w-4" />
                  Create your first project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {recentProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:border-primary/30 transition-colors duration-200"
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      {project.type === "video" ? (
                        <Video className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.date}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Helpful Tip */}
        <motion.div variants={itemVariants}>
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{randomTip}</p>
            </CardContent>
          </Card>
        </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardOverview;
