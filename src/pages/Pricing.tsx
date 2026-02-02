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
    description: "Perfect for trying out Postr",
    features: [
      "5 content generations/month",
      "Basic content analysis",
      "LinkedIn & X formats",
      "Community support",
    ],
    cta: "Get started",
    variant: "heroOutline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious content creators",
    features: [
      "Unlimited generations",
      "Advanced content analysis",
      "All platforms (LinkedIn, X, Threads, Reddit)",
      "Video to transcript",
      "Priority support",
      "Custom tone settings",
    ],
    cta: "Start free trial",
    variant: "hero" as const,
    highlighted: true,
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
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              Pricing
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Simple, transparent{" "}
              <span className="gradient-text">pricing</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Start for free. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`relative rounded-2xl border p-8 ${
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

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  size="lg"
                  className="mt-8 w-full"
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