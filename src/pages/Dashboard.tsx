import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  LogOut, 
  Sparkles, 
  FileText, 
  Video, 
  TrendingUp,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";

interface UserProfile {
  full_name: string | null;
  email: string;
  plan: string | null;
  monthly_generation_limit: number | null;
  monthly_video_limit: number | null;
  platforms: string[] | null;
  primary_goal: string | null;
}

const PLATFORM_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "reddit", label: "Reddit" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

const platformLimitForPlan = (plan: string | null | undefined) => {
  const normalized = (plan ?? "free").toLowerCase();
  if (normalized.includes("pro")) return 7;
  if (normalized.includes("creator")) return 5;
  return 3;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [platformsToAdd, setPlatformsToAdd] = useState<string[]>([]);
  const [savingPlatforms, setSavingPlatforms] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, email, plan, monthly_generation_limit, monthly_video_limit, platforms, primary_goal, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Redirect to onboarding if not completed
      if (!data?.onboarding_completed) {
        navigate("/onboarding");
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const currentPlatforms = profile?.platforms ?? [];
  const platformLimit = platformLimitForPlan(profile?.plan);
  const remainingPlatforms = Math.max(0, platformLimit - currentPlatforms.length);

  const togglePlatformToAdd = (platform: string) => {
    if (currentPlatforms.includes(platform)) return;

    if (platformsToAdd.includes(platform)) {
      setPlatformsToAdd(platformsToAdd.filter((p) => p !== platform));
      return;
    }

    if (platformsToAdd.length >= remainingPlatforms) {
      toast({
        title: "Platform limit reached",
        description: `Your plan allows up to ${platformLimit} platforms.`,
        variant: "destructive",
      });
      return;
    }

    setPlatformsToAdd([...platformsToAdd, platform]);
  };

  const savePlatforms = async () => {
    if (!user) return;
    if (platformsToAdd.length === 0) {
      setPlatformDialogOpen(false);
      return;
    }

    const nextPlatforms = Array.from(new Set([...currentPlatforms, ...platformsToAdd]));
    if (nextPlatforms.length > platformLimit) {
      toast({
        title: "Platform limit reached",
        description: `Your plan allows up to ${platformLimit} platforms.`,
        variant: "destructive",
      });
      return;
    }

    setSavingPlatforms(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          platforms: nextPlatforms,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, platforms: nextPlatforms } : prev));
      setPlatformsToAdd([]);
      setPlatformDialogOpen(false);

      toast({
        title: "Platforms updated",
        description: "Your platform preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSavingPlatforms(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-black text-primary-foreground">P</span>
            </div>
            <span className="text-xl font-bold">Postr</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name || profile?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to create some amazing content?
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.monthly_generation_limit || 10}</p>
                  <p className="text-sm text-muted-foreground">Generations left</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.monthly_video_limit || 2}</p>
                  <p className="text-sm text-muted-foreground">Videos left</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold capitalize">{profile?.plan || "Free"}</p>
                  <p className="text-sm text-muted-foreground">Current plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Platforms */}
          {currentPlatforms.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">Your Platforms</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentPlatforms.length}/{platformLimit} selected
                  </p>
                </div>

                <Dialog
                  open={platformDialogOpen}
                  onOpenChange={(open) => {
                    setPlatformDialogOpen(open);
                    if (!open) setPlatformsToAdd([]);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPlatforms.length >= platformLimit}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add platforms
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add platforms</DialogTitle>
                      <DialogDescription>
                        You can add up to {remainingPlatforms} more on your current plan.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORM_OPTIONS.map((opt) => {
                        const alreadySelected = currentPlatforms.includes(opt.value);
                        const selectedNow = platformsToAdd.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => togglePlatformToAdd(opt.value)}
                            disabled={alreadySelected}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                              alreadySelected
                                ? "cursor-not-allowed bg-muted/40 text-muted-foreground"
                                : selectedNow
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-secondary"
                            }`}
                          >
                            <span className="font-medium">{opt.label}</span>
                            {alreadySelected ? (
                              <Check className="h-4 w-4" />
                            ) : selectedNow ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setPlatformDialogOpen(false)}
                        disabled={savingPlatforms}
                      >
                        Cancel
                      </Button>
                      <Button variant="hero" onClick={savePlatforms} disabled={savingPlatforms}>
                        {savingPlatforms ? "Saving..." : "Save"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentPlatforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1 bg-secondary rounded-full text-sm capitalize"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Create New Content */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create New Content</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Transform your ideas into engaging posts for all your selected platforms.
            </p>
            <Button variant="hero" size="xl" className="gap-2">
              <Plus className="h-5 w-5" />
              New Project
            </Button>
          </div>

          {/* Recent Projects Placeholder */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>
            <div className="bg-card rounded-xl border p-8 text-center">
              <p className="text-muted-foreground">
                No projects yet. Create your first one!
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
