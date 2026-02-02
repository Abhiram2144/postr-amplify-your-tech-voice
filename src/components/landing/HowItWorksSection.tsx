import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Upload, Search, Sparkles, Send, Check } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload or paste",
    description: "Drop a video or paste your text, script, or idea into Postr.",
    details: "Supports video files, YouTube links, text documents, and raw ideas.",
  },
  {
    icon: Search,
    title: "Analyze",
    description: "Postr analyzes structure, clarity, and flow using AI.",
    details: "Identifies key themes, evaluates narrative strength, and scores content.",
  },
  {
    icon: Sparkles,
    title: "Improve",
    description: "Content is restructured and enhanced automatically.",
    details: "Adds psychological hooks, improves readability, and optimizes for engagement.",
  },
  {
    icon: Send,
    title: "Generate",
    description: "Get platform-ready posts and scripts instantly.",
    details: "Export to LinkedIn, X, Threads, Reddit, Instagram, YouTube, and TikTok.",
  },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Start auto-play animation when in view
  useEffect(() => {
    if (isInView && !isAutoPlaying) {
      setIsAutoPlaying(true);
      setActiveStep(0);
    }
  }, [isInView, isAutoPlaying]);

  // Auto-advance through steps
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          return prev; // Stay at last step
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsAutoPlaying(false);
  };

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative border-t border-border py-24 sm:py-32"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(199,89%,48%,0.03),transparent_70%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            How it works
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From idea to posts in{" "}
            <span className="gradient-text">four steps</span>
          </h2>
        </motion.div>

        <div className="mx-auto mt-16 max-w-5xl">
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-12"
          >
            {/* Background track */}
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-secondary" />
            
            {/* Animated progress */}
            <motion.div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Step indicators */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className="group relative flex flex-col items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Step circle */}
                    <motion.div
                      className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </motion.div>

                    {/* Step number badge */}
                    <motion.span
                      className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive || isCompleted
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {index + 1}
                    </motion.span>

                    {/* Step title (hidden on mobile) */}
                    <span
                      className={`mt-3 hidden text-sm font-medium transition-colors sm:block ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Active Step Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-8"
            >
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* Large Icon */}
                <motion.div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  {(() => {
                    const Icon = steps[activeStep].icon;
                    return <Icon className="h-12 w-12 text-primary" />;
                  })()}
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <motion.div
                    className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Step {activeStep + 1} of {steps.length}
                  </motion.div>
                  
                  <motion.h3
                    className="text-2xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {steps[activeStep].title}
                  </motion.h3>
                  
                  <motion.p
                    className="mt-2 text-lg text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {steps[activeStep].description}
                  </motion.p>
                  
                  <motion.p
                    className="mt-4 rounded-lg bg-secondary/50 p-4 text-sm text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    {steps[activeStep].details}
                  </motion.p>
                </div>
              </div>

              {/* Mini progress dots */}
              <div className="mt-6 flex justify-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeStep
                        ? "w-8 bg-primary"
                        : index < activeStep
                        ? "w-2 bg-primary/50"
                        : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Auto-play indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                if (!isAutoPlaying) setActiveStep(0);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAutoPlaying ? "Pause animation" : "Replay animation"}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
