import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Pause, Sparkles, Zap, Video, PenTool, CheckCircle2, Volume2, VolumeX, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    videoSrc: "/media/postr-topic.mp4",
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
    videoSrc: "/media/postr-script.mp4",
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
    videoSrc: "/media/postr-video.mp4",
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

/* ─── Video Player Component ─── */
const VideoPlayer = ({ src }: { src: string }) => {
  // ... implementation details ...

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      className="relative aspect-video group bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-xl backdrop-blur-sm"
          >
            <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
          </motion.div>
        </div>
      )}

      {/* Controls Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="group/slider relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 hover:h-2 mb-4 transition-all">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute h-full w-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="absolute h-full rounded-full bg-primary transition-all pointer-events-none"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="absolute h-3 w-3 rounded-full bg-white shadow-md top-1/2 -translate-y-1/2 -ml-1.5 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <span className="text-xs font-medium text-white/90 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={handleFullscreen}
            className="text-white hover:text-primary transition-colors"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
        className={`mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center ${isReversed ? "lg:flex-row-reverse" : ""
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
            <VideoPlayer src={demo.videoSrc} />
          </div>
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
