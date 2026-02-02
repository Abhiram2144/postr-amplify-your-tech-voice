import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  },
  {
    name: "Creator",
    price: "$9",
    period: "/month",
    description: "For growing content creators",
    cta: "Start free trial",
    variant: "heroOutline" as const,
    highlighted: false,
    bestFor: "Growing",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious content creators",
    cta: "Start free trial",
    variant: "hero" as const,
    highlighted: true,
    bestFor: "Scaling",
  },
];

const features = [
  { name: "Monthly generations", free: "5–10", creator: "100–200", pro: "Unlimited" },
  { name: "Video uploads", free: "1–2", creator: "20–30", pro: "Unlimited" },
  { name: "Text input", free: true, creator: true, pro: true },
  { name: "Video → transcript", free: true, creator: true, pro: true },
  { name: "Content analysis", free: "Basic", creator: "Advanced", pro: "Deep" },
  { name: "Psychological hooks", free: "Basic", creator: "Advanced", pro: "Advanced + Variants" },
  { name: "Platform exports", free: "All (limited)", creator: "Unlimited", pro: "Unlimited" },
  { name: "Project history", free: "Limited", creator: "Full", pro: "Full" },
  { name: "Processing speed", free: "Standard", creator: "Fast", pro: "Priority" },
];

const Pricing = () => {
  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="mx-auto h-5 w-5 text-primary" />;
    }
    return <span>{value}</span>;
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

          {/* Plan Cards */}
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
                <p className="mt-4 text-sm font-medium">
                  Best for: <span className="text-primary">{plan.bestFor}</span>
                </p>

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

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <h2 className="mb-8 text-center text-2xl font-bold">
              Compare <span className="gradient-text">features</span>
            </h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[40%] text-foreground font-bold">Feature</TableHead>
                    <TableHead className="text-center text-foreground font-bold">Free</TableHead>
                    <TableHead className="text-center text-foreground font-bold">Creator</TableHead>
                    <TableHead className="text-center text-foreground font-bold bg-primary/5">Pro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {renderFeatureValue(feature.free)}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {renderFeatureValue(feature.creator)}
                      </TableCell>
                      <TableCell className="text-center bg-primary/5">
                        {renderFeatureValue(feature.pro)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>

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