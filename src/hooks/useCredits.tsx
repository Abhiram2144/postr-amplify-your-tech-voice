import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { STRIPE_PLANS, PlanType } from "@/lib/stripe-config";

interface CreditsContextType {
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  updateCreditsAfterGeneration: (newUsed: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { plan: subscriptionPlan } = useSubscription();
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsLimit, setCreditsLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  const normalizePlan = (value?: string | null): PlanType => {
    const normalized = (value ?? "").toLowerCase();
    if (normalized.includes("pro")) return "pro";
    if (normalized.includes("creator")) return "creator";
    return "free";
  };

  const refreshCredits = useCallback(async () => {
    if (!user?.id) {
      setCreditsUsed(0);
      const fallbackPlan = normalizePlan(subscriptionPlan);
      setCreditsLimit(STRIPE_PLANS[fallbackPlan].limits.ideasPerMonth);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("generations_used_this_month, monthly_generation_limit, usage_reset_month, usage_reset_year")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Check if we need to reset (month changed)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      if (data.usage_reset_month !== currentMonth || data.usage_reset_year !== currentYear) {
        // Month changed, credits are reset
        setCreditsUsed(0);
      } else {
        setCreditsUsed(data.generations_used_this_month || 0);
      }
      
      const fallbackPlan = normalizePlan(subscriptionPlan);
      const planLimit = STRIPE_PLANS[fallbackPlan].limits.ideasPerMonth;
      const dbLimit = data.monthly_generation_limit ?? 0;
      setCreditsLimit(Math.max(dbLimit, planLimit));
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, subscriptionPlan]);

  const updateCreditsAfterGeneration = useCallback((newUsed: number) => {
    setCreditsUsed(newUsed);
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const creditsRemaining = Math.max(0, creditsLimit - creditsUsed);

  return (
    <CreditsContext.Provider
      value={{
        creditsUsed,
        creditsLimit,
        creditsRemaining,
        loading,
        refreshCredits,
        updateCreditsAfterGeneration,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};
