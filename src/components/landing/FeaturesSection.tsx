import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import { GraduationCap, Briefcase, Sparkles, PenTool, Video } from "lucide-react";

const useCases = [
  {
    icon: GraduationCap,
    title: "Educators",
    description:
      "Transform lessons and explanations into engaging posts and short-form videos that reach students beyond the classroom.",
    details: [
      "Lesson summaries for social sharing",
      "Educational explainers optimized per platform",
      "Course promotions with psychological hooks",
      "Teaching insights that build authority",
    ],
  },
  {
    icon: Briefcase,
    title: "Founders",
    description:
      "Share your journey, lessons learned, and industry insights without spending hours on content creation.",
    details: [
      "Founder journey storytelling",
      "Business insights and commentary",
      "Product launch announcements",
      "Thought leadership threads",
    ],
  },
  {
    icon: Sparkles,
    title: "Creators",
    description:
      "Repurpose ideas into posts that fit each platform's culture — LinkedIn, X, Threads, Instagram, TikTok, and more.",
    details: [
      "Cross-platform content repurposing",
      "Trending topic adaptation",
      "Audience engagement posts",
      "Brand voice consistency",
    ],
  },
  {
    icon: PenTool,
    title: "Writers",
    description:
      "Transform raw thoughts and long-form ideas into structured, engaging content. Turn articles into threads, essays into posts.",
    details: [
      "Article-to-thread conversion",
      "Essay-to-post breakdowns",
      "Newsletter teaser generation",
      "Opinion piece formatting",
    ],
  },
  {
    icon: Video,
    title: "Video Creators",
    description:
      "Convert videos into scripts, posts, and written content without losing meaning. Maximize the reach of every piece.",
    details: [
      "Video-to-post extraction",
      "Script generation from footage",
      "Episode highlight summaries",
      "Behind-the-scenes content",
    ],
  },
];

const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const sectionCount = useCases.length;
    const index = Math.min(
      Math.floor(latest * sectionCount),
      sectionCount - 1
    );
    setActiveIndex(index);
  });

  return (
    <section ref={containerRef} className="relative border-t border-border" style={{ height: `${(useCases.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(187,92%,42%,0.03),transparent_70%)]" />

        <div className="container relative mx-auto flex h-full items-center px-4">
          <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-16">
            {/* Left Side — Sticky Titles */}
            <div className="flex flex-col justify-center lg:w-[45%]">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground"
              >
                Built for every creator
              </motion.p>

              <div className="space-y-2">
                {useCases.map((useCase, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <motion.div
                      key={useCase.title}
                      className="relative cursor-default select-none"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <motion.h3
                        animate={{
                          color: isActive
                            ? "hsl(var(--foreground))"
                            : "hsl(var(--muted-foreground) / 0.35)",
                          scale: isActive ? 1 : 0.95,
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="origin-left text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
                      >
                        {useCase.title}
                      </motion.h3>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Side — Scrolling Content */}
            <div className="relative flex items-center lg:w-[55%]">
              <div className="relative w-full">
                {useCases.map((useCase, index) => {
                  const isActive = index === activeIndex;
                  const Icon = useCase.icon;

                  return (
                    <motion.div
                      key={useCase.title}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 30,
                        scale: isActive ? 1 : 0.96,
                        pointerEvents: isActive ? "auto" : "none",
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 flex items-start"
                      style={{ position: index === 0 ? "relative" : "absolute" }}
                    >
                      <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                        {/* Card Header Gradient */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-transparent px-8 py-10">
                          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
                          <div className="relative flex items-start gap-5">
                            <motion.div
                              animate={{ rotate: isActive ? 0 : -10, scale: isActive ? 1 : 0.8 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15"
                            >
                              <Icon className="h-7 w-7 text-primary" />
                            </motion.div>
                            <div>
                              <h4 className="text-2xl font-bold text-foreground">
                                {useCase.title}
                              </h4>
                              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                                {useCase.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Body — Details */}
                        <div className="px-8 py-8">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            What you can create
                          </p>
                          <ul className="grid gap-3 sm:grid-cols-2">
                            {useCase.details.map((detail, i) => (
                              <motion.li
                                key={detail}
                                initial={false}
                                animate={{
                                  opacity: isActive ? 1 : 0,
                                  x: isActive ? 0 : 15,
                                }}
                                transition={{
                                  duration: 0.4,
                                  delay: isActive ? i * 0.06 : 0,
                                  ease: "easeOut",
                                }}
                                className="flex items-center gap-2.5 text-sm text-foreground"
                              >
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {detail}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5">
          {useCases.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                width: index === activeIndex ? 24 : 8,
                backgroundColor:
                  index === activeIndex
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground) / 0.25)",
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
