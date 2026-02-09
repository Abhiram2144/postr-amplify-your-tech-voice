import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";
import { STRIPE_PLANS, type BillingCycle, type PlanType } from "@/lib/stripe-config";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddedCheckoutModal } from "@/components/checkout/EmbeddedCheckoutModal";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan: subscriptionPlan, checkSubscription } = useSubscription();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [profilePlan, setProfilePlan] = useState<PlanType>("free");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  // Fetch user profile plan
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("plan")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        const plan = data?.plan?.toLowerCase() || "free";
        if (plan.includes("pro")) setProfilePlan("pro");
        else if (plan.includes("creator")) setProfilePlan("creator");
        else setProfilePlan("free");
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Check subscription status when user loads
  useEffect(() => {
    if (user && !authLoading) {
      checkSubscription();
    }
  }, [user, authLoading, checkSubscription]);

  // Use subscription plan if not free, otherwise fall back to profile plan
  const currentPlan = subscriptionPlan !== "free" ? subscriptionPlan : profilePlan;

  const plans = [
    {
      name: "Free",
      key: "free" as const,
      price: "$0",
      period: "forever",
      description: "For creators exploring content generation",
      cta: currentPlan === "free" ? "Current plan" : "Get started",
      variant: "heroOutline" as const,
      highlighted: false,
      bestFor: "Exploring",
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
      analysisDetail: "Basic scores & 2 suggestions",
    },
    {
      name: "Creator",
      key: "creator" as const,
      price: billingCycle === "monthly" 
        ? `$${STRIPE_PLANS.creator.monthly.price}` 
        : `$${STRIPE_PLANS.creator.yearly.monthlyEquivalent.toFixed(0)}`,
      period: billingCycle === "monthly" ? "/month" : "/month (billed yearly)",
      yearlyTotal: billingCycle === "yearly" ? `$${STRIPE_PLANS.creator.yearly.price}/year` : null,
      description: "For creators posting consistently",
      cta: currentPlan === "creator" ? "Current plan" : "Upgrade",
      variant: "hero" as const,
      highlighted: true,
      bestFor: "Growing",
      priceId: billingCycle === "monthly" 
        ? STRIPE_PLANS.creator.monthly.priceId 
        : STRIPE_PLANS.creator.yearly.priceId,
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
      analysisDetail: "Detailed scores, 3 strengths & improvements",
    },
    {
      name: "Pro",
      key: "pro" as const,
      price: billingCycle === "monthly" 
        ? `$${STRIPE_PLANS.pro.monthly.price}` 
        : `$${STRIPE_PLANS.pro.yearly.monthlyEquivalent.toFixed(0)}`,
      period: billingCycle === "monthly" ? "/month" : "/month (billed yearly)",
      yearlyTotal: billingCycle === "yearly" ? `$${STRIPE_PLANS.pro.yearly.price}/year` : null,
      description: "For creators scaling their reach",
      cta: currentPlan === "pro" ? "Current plan" : "Upgrade",
      variant: "heroOutline" as const,
      highlighted: false,
      bestFor: "Scaling",
      priceId: billingCycle === "monthly" 
        ? STRIPE_PLANS.pro.monthly.priceId 
        : STRIPE_PLANS.pro.yearly.priceId,
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
      analysisDetail: "Deep scores, 5 strengths & improvements, psychological hooks",
    },
  ];

  const handleCtaClick = async (plan: typeof plans[0]) => {
    if (authLoading || loadingPlan) return;

    // Free plan - just navigate
    if (plan.key === "free") {
      if (!user) {
        navigate("/signup");
      } else {
        navigate("/dashboard");
      }
      return;
    }

    // Current plan - do nothing
    if (currentPlan === plan.key) {
      return;
    }

    // Paid plan - need to be logged in
    if (!user) {
      navigate("/signup");
      return;
    }

    // Open embedded Stripe checkout
    if (plan.priceId) {
      setSelectedPriceId(plan.priceId);
      setShowCheckoutModal(true);
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setSelectedPriceId(null);
    checkSubscription();
    toast({
      title: "Subscription activated!",
      description: "Welcome to your new plan. Redirecting to dashboard...",
    });
    navigate("/dashboard?checkout=success");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Simple, transparent{" "}
              <span className="gradient-text">pricing</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Start for free. Upgrade when you're ready to create more.
            </p>
          </motion.div>

          {/* Billing cycle toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <Label 
              htmlFor="billing-cycle" 
              className={billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}
            >
              Monthly
            </Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label 
              htmlFor="billing-cycle" 
              className={billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}
            >
              Yearly
              <span className="ml-2 text-xs text-primary font-medium">Save 20%</span>
            </Label>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`relative rounded-2xl border p-6 ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      Most popular
                    </span>
                  </div>
                )}

                {currentPlan === plan.key && (
                  <div className="absolute -top-3 right-4">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                      Your plan
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.yearlyTotal && (
                  <p className="text-sm text-muted-foreground mt-1">{plan.yearlyTotal}</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <p className="mt-2 text-sm font-medium">
                  Best for: <span className="text-primary">{plan.bestFor}</span>
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => handleCtaClick(plan)}
                  disabled={authLoading || loadingPlan === plan.key || currentPlan === plan.key}
                >
                  <span className="inline-flex items-center justify-center">
                    {loadingPlan === plan.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {plan.cta}
                        {currentPlan !== plan.key && <ArrowRight className="ml-1 h-4 w-4" />}
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Embedded Checkout Modal */}
      {selectedPriceId && (
        <EmbeddedCheckoutModal
          open={showCheckoutModal}
          onOpenChange={setShowCheckoutModal}
          priceId={selectedPriceId}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default Pricing;
