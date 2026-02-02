import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden pt-16">
      {/* Background Effects - Light theme */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(199,89%,48%,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(187,92%,42%,0.04),transparent_50%)]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(214,32%,91%,0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(214,32%,91%,0.4)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <motion.div
        style={{ y, opacity }}
        className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-accent"
            />
            Now in public beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Turn your tech ideas into{" "}
          <span className="gradient-text">content people actually read.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Postr helps developers and tech professionals transform ideas, videos, and
          scripts into high-quality posts for LinkedIn, X, Threads, and Reddit.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            animate={{ 
              boxShadow: ["0 0 20px hsl(199,89%,48%,0.2)", "0 0 30px hsl(199,89%,48%,0.3)", "0 0 20px hsl(199,89%,48%,0.2)"]
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity },
              scale: { duration: 0.2 }
            }}
            className="rounded-lg"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Get started free
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#how-it-works">
                <Play className="mr-1 h-5 w-5" />
                See how it works
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Platform Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <span className="text-sm text-muted-foreground">Works with your favorite platforms</span>
          <div className="flex items-center gap-4">
            {["LinkedIn", "X", "Threads", "Reddit"].map((platform, index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -2, scale: 1.05 }}
                className="flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {platform}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 p-1"
        >
          <motion.div className="h-2 w-full rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
