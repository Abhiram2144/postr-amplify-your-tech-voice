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

  const plan = (profile?.plan || "free").toLowerCase();
  const generationsLimit = plan.includes("pro") ? 100 : plan.includes("creator") ? 50 : 10;
  const videosLimit = plan.includes("pro") ? 20 : plan.includes("creator") ? 10 : 2;

  const generationsUsed = generationsLimit - (profile?.monthly_generation_limit || 0);
  const videosUsed = videosLimit - (profile?.monthly_video_limit || 0);

  const generationsPercent = (generationsUsed / generationsLimit) * 100;
  const videosPercent = (videosUsed / videosLimit) * 100;

  const getPlanFeatures = () => {
    if (plan.includes("pro")) {
      return ["100 text generations/month", "20 video analyses/month", "7 platforms", "Priority support"];
    }
    if (plan.includes("creator")) {
      return ["50 text generations/month", "10 video analyses/month", "5 platforms", "Email support"];
    }
    return ["10 text generations/month", "2 video analyses/month", "3 platforms", "Community support"];
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
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-2xl font-bold text-foreground capitalize">{profile?.plan || "Free"}</p>
                  </div>
                </div>
                {!plan.includes("pro") && (
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
                  <p className="text-sm text-muted-foreground">of {generationsLimit} used this month</p>
                </div>
                <p className="text-lg font-medium text-primary">
                  {profile?.monthly_generation_limit || 0} left
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={generationsPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{generationsLimit}</span>
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
                  <p className="text-sm text-muted-foreground">of {videosLimit} used this month</p>
                </div>
                <p className="text-lg font-medium text-accent">
                  {profile?.monthly_video_limit || 0} left
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={videosPercent} className="h-3 [&>div]:bg-accent" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{videosLimit}</span>
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
        {!plan.includes("pro") && (
          <motion.div variants={itemVariants}>
            <Card className="bg-muted/50 border-0">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You're using Postr on {profile?.plan || "Free"}. Upgrade to unlock more platforms and generations.
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
