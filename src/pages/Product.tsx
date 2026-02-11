import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, FileText, ChevronDown, Sparkles, Zap, Video, PenTool, Globe, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

/* ─── Video Demo Data ─── */
const videoDemos = [
  {
    id: "topic-to-content",
    badge: "Mode 1",
    title: "Topic → Content",
    subtitle: "From a brief idea to polished posts in seconds",
    description:
      "Drop in a topic or rough idea, and Postr's AI analyzes structure, clarity, and engagement potential — then generates platform-native posts tailored to your audience.",
    icon: Zap,
    gradient: "from-primary/20 via-primary/5 to-transparent",
    accentColor: "primary",
    videoPlaceholder: "topic-demo",
    transcript: `[0:00] Start by typing a brief topic — for example, "Why developers should blog."
[0:05] Postr instantly analyzes your input for structure, clarity, and hook potential.
[0:12] The AI scores your idea and suggests improvements to maximize engagement.
[0:18] Choose your target platforms — LinkedIn, X, Threads, or Reddit.
[0:24] Platform-native posts are generated, each with the right tone, length, and formatting.
[0:30] Copy, edit, or regenerate any output until it's perfect.`,
    highlights: ["Instant analysis", "Smart scoring", "Multi-platform output"],
  },
  {
    id: "script-to-content",
    badge: "Mode 2",
    title: "Script → Content",
    subtitle: "Transform long-form scripts into bite-sized content",
    description:
      "Paste a full script or article draft — Postr breaks it down, identifies key insights, and repackages them as platform-optimized posts that retain your unique voice.",
    icon: PenTool,
    gradient: "from-accent/20 via-accent/5 to-transparent",
    accentColor: "accent",
    videoPlaceholder: "script-demo",
    transcript: `[0:00] Paste your full script or article draft into the editor.
[0:06] Postr identifies key arguments, insights, and quotable moments.
[0:12] The AI preserves your voice while restructuring for each platform's format.
[0:18] LinkedIn gets a professional narrative; X gets punchy threads; Reddit gets detailed breakdowns.
[0:25] Each output includes hooks, CTAs, and formatting optimized for that platform.
[0:32] Iterate on any individual post without affecting the others.`,
    highlights: ["Voice preservation", "Key insight extraction", "Format adaptation"],
  },
  {
    id: "video-to-content",
    badge: "Mode 3",
    title: "Video → Content",
    subtitle: "Turn video content into written gold",
    description:
      "Link a YouTube video or paste a transcript — Postr extracts the most valuable moments and creates text posts, thread ideas, and discussion starters from your video content.",
    icon: Video,
    gradient: "from-primary/15 via-accent/10 to-transparent",
    accentColor: "primary",
    videoPlaceholder: "video-demo",
    transcript: `[0:00] Paste a YouTube link or raw video transcript.
[0:05] Postr processes the video, extracting key topics and timestamps.
[0:12] The AI identifies the most shareable and engaging moments.
[0:18] Written posts are generated that capture the video's value in text form.
[0:24] Thread-style breakdowns, discussion openers, and key-takeaway posts are created.
[0:30] Perfect for repurposing podcast episodes, tutorials, and conference talks.`,
    highlights: ["Auto-extraction", "Timestamp mapping", "Repurposing engine"],
  },
];

const platformBadges = [
  { name: "LinkedIn", color: "bg-blue-500/10 text-blue-600" },
  { name: "X / Twitter", color: "bg-foreground/10 text-foreground" },
  { name: "Threads", color: "bg-foreground/10 text-foreground" },
  { name: "Reddit", color: "bg-orange-500/10 text-orange-600" },
  { name: "YouTube Shorts", color: "bg-red-500/10 text-red-600" },
  { name: "TikTok", color: "bg-pink-500/10 text-pink-600" },
  { name: "Instagram Reels", color: "bg-purple-500/10 text-purple-600" },
];

/* ─── Video Demo Card Component ─── */
const VideoDemoSection = ({
  demo,
  index,
  isReversed,
}: {
  demo: (typeof videoDemos)[0];
  index: number;
  isReversed: boolean;
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Background accent glow */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b ${demo.gradient} rounded-3xl opacity-60`}
      />

      <div
        className={`mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center ${
          isReversed ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Video Player Area */}
        <motion.div
          initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {/* Video Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Center play button */}
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 shadow-xl backdrop-blur-sm transition-all group-hover:bg-primary glow-effect">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </motion.button>

              {/* Badge overlay */}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {demo.badge}
                </span>
              </div>

              {/* Duration overlay */}
              <div className="absolute bottom-4 right-4">
                <span className="rounded-md bg-background/80 px-2 py-1 text-xs font-mono backdrop-blur-sm">
                  0:35
                </span>
              </div>
            </div>

            {/* Video bottom bar */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted w-32">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    whileInView={{ width: isPlaying ? "100%" : "0%" }}
                    transition={{ duration: 35, ease: "linear" }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Demo Preview
              </span>
            </div>
          </div>

          {/* Transcript Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="group/btn flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground w-full"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>View Transcript</span>
              <motion.div
                animate={{ rotate: showTranscript ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showTranscript && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-xl border border-border bg-card p-5">
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                      {demo.transcript}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 space-y-6"
        >
          {/* Icon + Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <demo.icon className="h-6 w-6 text-primary" />
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              {demo.badge}
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              {demo.title.split("→")[0]}
              <span className="gradient-text">→ {demo.title.split("→")[1]}</span>
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">{demo.subtitle}</p>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{demo.description}</p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2">
            {demo.highlights.map((highlight) => (
              <motion.div
                key={highlight}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground">{highlight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

/* ─── Main Product Page ─── */
const Product = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
              See it in action
            </motion.span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Three ways to create{" "}
              <span className="gradient-text">brilliant content</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Whether you start with an idea, a script, or a video — Postr turns it
              into high-performing, platform-native posts. Watch each mode in action.
            </motion.p>
          </motion.div>

          {/* Platform badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {platformBadges.map((platform, i) => (
              <motion.span
                key={platform.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className={`rounded-full px-3 py-1 text-xs font-medium ${platform.color}`}
              >
                {platform.name}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Separator */}
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto h-px max-w-lg bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Video Demo Sections */}
        <div className="space-y-24 px-4">
          {videoDemos.map((demo, index) => (
            <VideoDemoSection
              key={demo.id}
              demo={demo}
              index={index}
              isReversed={index % 2 !== 0}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto mt-24 px-4 text-center"
        >
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Ready to create <span className="gradient-text">smarter content</span>?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start for free — no credit card required.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">
                  Get started free
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;
