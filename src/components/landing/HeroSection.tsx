import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217,91%,60%,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(174,100%,50%,0.1),transparent_50%)]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(222,47%,15%,0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(222,47%,15%,0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Now in public beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Turn your tech ideas into{" "}
          <span className="gradient-text">content people actually read.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Postr helps developers and tech professionals transform ideas, videos, and
          scripts into high-quality posts for LinkedIn, X, Threads, and Reddit.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Button variant="hero" size="xl" asChild>
            <Link to="/signup">
              Get started free
              <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <a href="#how-it-works">
              <Play className="mr-1 h-5 w-5" />
              See how it works
            </a>
          </Button>
        </motion.div>

        {/* Platform Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <span className="text-sm text-muted-foreground">Works with your favorite platforms</span>
          <div className="flex items-center gap-6">
            {["LinkedIn", "X", "Threads", "Reddit"].map((platform) => (
              <div
                key={platform}
                className="flex h-10 items-center justify-center rounded-lg border border-border bg-secondary/50 px-4 text-sm font-medium backdrop-blur-sm"
              >
                {platform}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;