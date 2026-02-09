import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { PlanType } from "@/lib/stripe-config";

interface SubscriptionContextType {
  plan: PlanType;
  subscribed: boolean;
  subscriptionEnd: string | null;
  cancellingAt: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  openCheckout: (priceId: string) => Promise<void>;
  openEmbeddedCheckout: (priceId: string) => Promise<string | null>;
  openCustomerPortal: () => Promise<void>;
  cancelSubscription: () => Promise<{ success: boolean; cancelsAt?: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [cancellingAt, setCancellingAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setPlan("free");
      setSubscribed(false);
      setSubscriptionEnd(null);
      setCancellingAt(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setPlan(data.plan || "free");
      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);
      setCancellingAt(data.cancelling_at || null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setPlan("free");
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  // Regular checkout (redirect to Stripe)
  const openCheckout = async (priceId: string) => {
    if (!session?.access_token) {
      throw new Error("Must be logged in to checkout");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  // Embedded checkout - returns client secret for in-app checkout
  const openEmbeddedCheckout = async (priceId: string): Promise<string | null> => {
    if (!session?.access_token) {
      throw new Error("Must be logged in to checkout");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, embedded: true },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    
    if (data?.clientSecret) {
      return data.clientSecret;
    }
    
    // Fallback to redirect if embedded not supported
    if (data?.url) {
      window.location.href = data.url;
    }
    
    return null;
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      throw new Error("Must be logged in to manage subscription");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const cancelSubscription = async (): Promise<{ success: boolean; cancelsAt?: string }> => {
    if (!session?.access_token) {
      throw new Error("Must be logged in to cancel subscription");
    }

    const { data, error } = await supabase.functions.invoke("cancel-subscription", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    
    if (data?.success) {
      setCancellingAt(data.cancels_at);
      // Refresh subscription data
      await checkSubscription();
      return { success: true, cancelsAt: data.cancels_at };
    }
    
    throw new Error(data?.error || "Failed to cancel subscription");
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user, checkSubscription]);

  // Check subscription every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        subscribed,
        subscriptionEnd,
        cancellingAt,
        loading,
        checkSubscription,
        openCheckout,
        openEmbeddedCheckout,
        openCustomerPortal,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
