import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For creators exploring content generation",
    cta: "Get started",
    variant: "heroOutline" as const,
    highlighted: false,
    bestFor: "Exploring",
    features: [
      "5 ideas per month",
      "1–2 video uploads",
      "Text and video input",
      "Basic content analysis",
      "All platforms (limited exports)",
      "Standard processing",
    ],
  },
  {
    name: "Creator",
    price: "$14",
    period: "/month",
    description: "For creators posting consistently",
    cta: "Start free trial",
    variant: "hero" as const,
    highlighted: true,
    bestFor: "Growing",
    features: [
      "100 ideas per month",
      "20 video uploads",
      "Text and video input",
      "Advanced content analysis",
      "Unlimited platform exports",
      "Fast processing",
      "Full project history",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For creators scaling their reach",
    cta: "Start free trial",
    variant: "heroOutline" as const,
    highlighted: false,
    bestFor: "Scaling",
    features: [
      "Unlimited ideas",
      "Unlimited video uploads",
      "Text and video input",
      "Deep content analysis",
      "Unlimited platform exports",
      "Priority processing",
      "Full project history",
      "Tone customization",
    ],
  },
];

const Pricing = () => {
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
                  asChild
                >
                  <Link to="/signup">
                    {plan.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
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
