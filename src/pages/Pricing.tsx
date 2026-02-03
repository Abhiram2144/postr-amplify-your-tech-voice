import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Postr",
    cta: "Get started",
    variant: "heroOutline" as const,
    highlighted: false,
    bestFor: "Trying",
    features: [
      "5–10 monthly generations",
      "1–2 video uploads",
      "Text input",
      "Video → transcript",
      "Basic content analysis",
      "Basic psychological hooks",
      "All platforms (limited)",
      "Limited project history",
      "Standard processing speed",
    ],
  },
  {
    name: "Creator",
    price: "$14",
    period: "/month",
    description: "For growing content creators",
    cta: "Start free trial",
    variant: "hero" as const,
    highlighted: true,
    bestFor: "Growing",
    features: [
      "100–200 monthly generations",
      "20–30 video uploads",
      "Text input",
      "Video → transcript",
      "Advanced content analysis",
      "Advanced psychological hooks",
      "Unlimited platform exports",
      "Full project history",
      "Fast processing speed",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious content creators",
    cta: "Start free trial",
    variant: "heroOutline" as const,
    highlighted: false,
    bestFor: "Scaling",
    features: [
      "Unlimited generations",
      "Unlimited video uploads",
      "Text input",
      "Video → transcript",
      "Deep content analysis",
      "Advanced + Variants hooks",
      "Unlimited platform exports",
      "Full project history",
      "Priority processing speed",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const handleCtaClick = async () => {
    if (authLoading) return;

    if (!user) {
      navigate("/signup");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      navigate(data?.onboarding_completed ? "/dashboard" : "/onboarding");
    } catch (error) {
      toast({
        title: "Couldn't continue",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      // Fallback: let them finish onboarding
      navigate("/onboarding");
    }
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
              Start for free. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
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

                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
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
                  onClick={handleCtaClick}
                  disabled={authLoading}
                >
                  <span className="inline-flex items-center justify-center">
                    {plan.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            All plans include a 14-day free trial. No credit card required.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;