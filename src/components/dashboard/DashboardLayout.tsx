import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "./DashboardSidebar";

export interface UserProfile {
  full_name: string | null;
  email: string;
  plan: string | null;
  monthly_generation_limit: number | null;
  monthly_video_limit: number | null;
  generations_used_this_month: number | null;
  platforms: string[] | null;
  primary_goal: string | null;
  avatar_url: string | null;
}

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        .select("full_name, email, plan, monthly_generation_limit, monthly_video_limit, generations_used_this_month, platforms, primary_goal, onboarding_completed, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

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

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/20 animate-pulse" />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar
        profile={profile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main 
        className={`flex-1 transition-all duration-300 ease-out ${
          sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-screen"
          >
            <Outlet context={{ profile, setProfile }} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
