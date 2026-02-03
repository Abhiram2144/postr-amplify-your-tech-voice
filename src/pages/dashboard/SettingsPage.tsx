import { useState, useEffect } from "react";
import { useOutletContext, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";
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

const platformLimitForPlan = (plan: string | null | undefined) => {
  const normalized = (plan ?? "free").toLowerCase();
  if (normalized.includes("pro")) return 7;
  if (normalized.includes("creator")) return 5;
  return 3;
};

const SettingsPage = () => {
  const { profile, setProfile } = useOutletContext<DashboardContext>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "platforms", "billing", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    setFullName(profile?.full_name || "");
  }, [profile?.full_name]);

  const currentPlatforms = profile?.platforms ?? [];
  const platformLimit = platformLimitForPlan(profile?.plan);

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
            <TabsTrigger value="billing" className="flex-1 gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
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

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Manage your subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-semibold text-foreground capitalize text-lg">
                        {profile?.plan || "Free"} Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(profile?.plan || "free").toLowerCase().includes("pro")
                          ? "100 generations, 20 videos, 7 platforms"
                          : (profile?.plan || "free").toLowerCase().includes("creator")
                            ? "50 generations, 10 videos, 5 platforms"
                            : "10 generations, 2 videos, 3 platforms"}
                      </p>
                    </div>
                    {!(profile?.plan || "free").toLowerCase().includes("pro") && (
                      <Button variant="hero" onClick={() => navigate("/pricing")}>
                        Upgrade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Add or update your payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">No payment method on file</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
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
