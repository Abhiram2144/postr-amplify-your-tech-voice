import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Search, Sparkles, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: Upload,
    title: "What Postr does",
    description:
      "Postr transforms your raw ideas, videos, and scripts into polished, platform-ready content. It's not a scheduler—it's a content intelligence engine for creators.",
  },
  {
    icon: Search,
    title: "How content analysis works",
    description:
      "Our system analyzes structure, clarity, hooks, and flow. It identifies what makes your content engaging and where it needs improvement before generating anything.",
  },
  {
    icon: Sparkles,
    title: "What outputs you get",
    description:
      "Enhanced scripts, improvement suggestions, and platform-specific posts. Each output is tailored to resonate with your target audience on that platform.",
  },
  {
    icon: Globe,
    title: "Supported platforms",
    description:
      "LinkedIn for professional insights, X for threads and quick takes, Threads for casual conversation, Reddit for in-depth discussions, and video scripts for Instagram, YouTube, and TikTok.",
  },
];

const workflowSteps = [
  "Start with an idea, script, or video",
  "Understand structure and clarity",
  "Improve flow and engagement",
  "Generate platform-native content",
];

const Product = () => {
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
              Product
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Content intelligence for{" "}
              <span className="gradient-text">every creator</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Understand what Postr does, how it works, and why it's different from
              generic AI writing tools.
            </p>
          </motion.div>

          {/* Workflow Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-12 max-w-3xl"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">
                Get started free
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;
