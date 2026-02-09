import { useState, useEffect } from "react";
import { useOutletContext, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Globe,
  CreditCard,
  Shield,
  Check,
  Plus,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";
import { STRIPE_PLANS, PlanType } from "@/lib/stripe-config";
import { EmbeddedCheckoutModal } from "@/components/checkout/EmbeddedCheckoutModal";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";

interface DashboardContext {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const PLATFORM_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "reddit", label: "Reddit" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

const normalizePlan = (value?: string | null): PlanType => {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("creator")) return "creator";
  return "free";
};

const normalizeSettingsTab = (value?: string | null) => {
  if (!value) return null;
  if (value === "billing") return "plan";
  if (["profile", "platforms", "plan", "security"].includes(value)) return value;
  return null;
};

const platformLimitForPlan = (effectivePlan: PlanType) => {
  if (effectivePlan === "pro") return 7;
  if (effectivePlan === "creator") return 5;
  return 3;
};

// My Plan Tab Component
const MyPlanTabContent = ({ profile }: { profile: UserProfile | null }) => {
  const { 
    plan: subscriptionPlan, 
    subscribed, 
    subscriptionEnd, 
    cancellingAt,
    openCustomerPortal, 
    cancelSubscription,
    checkSubscription,
    loading 
  } = useSubscription();
  const { toast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const profilePlan = normalizePlan(profile?.plan);
  const effectivePlan = subscriptionPlan !== "free" ? subscriptionPlan : profilePlan;
  const isPaidPlan = effectivePlan !== "free";
  const isCancelling = !!cancellingAt;

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoadingCancel(true);
    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast({
          title: "Subscription cancelled",
          description: `Your subscription will end on ${new Date(result.cancelsAt!).toLocaleDateString()}. You'll keep access until then.`,
        });
        setShowCancelDialog(false);
      }
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleUpgrade = (priceId: string) => {
    setSelectedPriceId(priceId);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setSelectedPriceId(null);
    checkSubscription();
    toast({
      title: "Subscription activated!",
      description: "Welcome to your new plan. Enjoy the upgraded features!",
    });
  };

  const getPlanStyles = (planType: PlanType) => {
    if (planType === "pro") {
      return "border-primary/40 bg-gradient-to-br from-primary/10 via-background to-accent/5 ring-2 ring-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)]";
    }
    if (planType === "creator") {
      return "border-accent/30 bg-gradient-to-br from-accent/8 via-background to-primary/5";
    }
    return "border-border hover:border-primary/30 bg-muted/30";
  };

  const plans = [
    {
      id: "free" as PlanType,
      name: STRIPE_PLANS.free.name,
      price: "$0",
      period: "/month",
      features: [
        "10 ideas per month",
        "2 video uploads",
        "2 projects max",
        "1 free rewrite",
        "Text and video input",
        "Basic content analysis",
        "3 platforms",
        "Standard processing",
      ],
      priceId: null,
    },
    {
      id: "creator" as PlanType,
      name: STRIPE_PLANS.creator.name,
      price: "$14",
      period: "/month",
      features: [
        "60 ideas per month",
        "20 video uploads",
        "10 projects max",
        "1 free rewrite",
        "Text and video input",
        "Advanced content analysis",
        "Unlimited platform exports",
        "Fast processing",
        "Full project history",
      ],
      priceId: STRIPE_PLANS.creator.monthly.priceId,
      popular: true,
    },
    {
      id: "pro" as PlanType,
      name: STRIPE_PLANS.pro.name,
      price: "$29",
      period: "/month",
      features: [
        "150 ideas per month",
        "50 video uploads",
        "50 projects max",
        "2 free rewrites",
        "Text and video input",
        "Deep content analysis",
        "Unlimited platform exports",
        "Priority processing",
        "Full project history",
        "Tone customization",
      ],
      priceId: STRIPE_PLANS.pro.monthly.priceId,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {isPaidPlan
              ? subscriptionEnd
                ? `Renews on ${new Date(subscriptionEnd).toLocaleDateString()}`
                : `Active plan: ${STRIPE_PLANS[effectivePlan].name}`
              : "You're currently on the free plan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((planOption) => {
              const isCurrentPlan = effectivePlan === planOption.id;
              const canUpgrade = !isCurrentPlan && planOption.priceId;
              const isDowngrade = 
                (effectivePlan === "pro" && planOption.id !== "pro") ||
                (effectivePlan === "creator" && planOption.id === "free");

              return (
                <div
                  key={planOption.id}
                  className={`relative rounded-xl border p-4 transition-all duration-200 ${
                    isCurrentPlan
                      ? getPlanStyles(planOption.id)
                      : planOption.popular
                      ? getPlanStyles(planOption.id)
                      : "border-border hover:border-primary/30 bg-muted/30"
                  }`}
                >
                  {/* Current plan badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Your Plan
                    </div>
                  )}
                  
                  {/* Popular badge */}
                  {planOption.popular && !isCurrentPlan && (
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                      Popular
                    </div>
                  )}

                  <div className="mt-2">
                    <h3 className="font-semibold text-foreground">{planOption.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-foreground">{planOption.price}</span>
                      <span className="text-sm text-muted-foreground">{planOption.period}</span>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {planOption.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4">
                    {isCurrentPlan ? (
                      subscribed ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleManageSubscription}
                          disabled={loadingPortal}
                        >
                          {loadingPortal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Manage
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Current Plan
                        </Button>
                      )
                    ) : canUpgrade && !isDowngrade ? (
                      <Button
                        variant={planOption.popular ? "hero" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpgrade(planOption.priceId!)}
                        disabled={showCheckoutModal}
                      >
                        Upgrade
                      </Button>
                    ) : isDowngrade && subscribed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleManageSubscription}
                        disabled={loadingPortal}
                      >
                        Downgrade
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            {isCancelling
              ? `Your subscription will end on ${new Date(cancellingAt!).toLocaleDateString()}`
              : isPaidPlan
              ? "Cancel your subscription anytime"
              : "You do not have an active subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          {!isCancelling && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              disabled={!isPaidPlan || loadingCancel}
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Cancel subscription
            </Button>
          )}
          {isPaidPlan && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Manage billing
                  <ExternalLink className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              You will keep access until the end of your current billing period.
            </DialogDescription>
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
              Your subscription will remain active until {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : "the end of your billing period"}.
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={loadingCancel}
            >
              {loadingCancel ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embedded Checkout Modal */}
      {selectedPriceId && (
        <EmbeddedCheckoutModal
          open={showCheckoutModal}
          onOpenChange={setShowCheckoutModal}
          priceId={selectedPriceId}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </motion.div>
  );
};

const SettingsPage = () => {
  const { profile, setProfile } = useOutletContext<DashboardContext>();
  const { user } = useAuth();
  const { plan: subscriptionPlan } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  const profilePlan = normalizePlan(profile?.plan);
  const effectivePlan = subscriptionPlan !== "free" ? subscriptionPlan : profilePlan;

  const tabParam = searchParams.get("tab");
  const normalizedTab = normalizeSettingsTab(tabParam);

  useEffect(() => {
    const nextTab = normalizeSettingsTab(new URLSearchParams(location.search).get("tab"));
    if (nextTab) {
      setActiveTab(nextTab);
    }
  }, [location.search]);

  useEffect(() => {
    setFullName(profile?.full_name || "");
  }, [profile?.full_name]);

  const currentPlatforms = profile?.platforms ?? [];
  const platformLimit = platformLimitForPlan(effectivePlan);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, full_name: fullName } : prev));
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (error) {
      toast({ title: "Update failed", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = async (platform: string) => {
    if (!user) return;

    const isSelected = currentPlatforms.includes(platform);
    let nextPlatforms: string[];

    if (isSelected) {
      nextPlatforms = currentPlatforms.filter((p) => p !== platform);
    } else {
      if (currentPlatforms.length >= platformLimit) {
        toast({
          title: "Platform limit reached",
          description: `Your plan allows up to ${platformLimit} platforms.`,
          variant: "destructive",
        });
        return;
      }
      nextPlatforms = [...currentPlatforms, platform];
    }

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
      toast({ title: "Platforms updated" });
    } catch (error) {
      toast({ title: "Update failed", description: getSafeErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="profile" className="flex-1 gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex-1 gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Platforms</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex-1 gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">My Plan</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <Button
                    variant="hero"
                    onClick={handleSaveProfile}
                    disabled={saving || fullName === profile?.full_name}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Platforms</CardTitle>
                  <CardDescription>
                    Select platforms for content generation ({currentPlatforms.length}/{platformLimit} selected)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const isSelected = currentPlatforms.includes(platform.value);
                      return (
                        <button
                          key={platform.value}
                          onClick={() => togglePlatform(platform.value)}
                          className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className="font-medium">{platform.label}</span>
                          {isSelected ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* My Plan Tab */}
          <TabsContent value="plan" className="mt-6">
            <MyPlanTabContent profile={profile} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Only show password change if user signed up with email/password (not OAuth) */}
              {profile?.auth_provider !== "google" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" />
                    </div>
                    <Button variant="outline">Update Password</Button>
                  </CardContent>
                </Card>
              )}

              {profile?.auth_provider === "google" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>Your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Signed in with Google</p>
                        <p className="text-sm text-muted-foreground">Password is managed by Google</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                    <X className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
