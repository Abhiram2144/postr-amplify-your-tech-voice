import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Upload, Search, Sparkles, Send, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Upload,
    title: "Upload or paste",
    description: "Drop a video or paste your text, script, or idea into Postr.",
    preview: {
      type: "input",
      content: "My latest product launch video explaining our new AI features...",
    },
  },
  {
    icon: Search,
    title: "Analyze",
    description: "Postr analyzes structure, clarity, and flow using AI.",
    preview: {
      type: "analysis",
      metrics: ["Structure: Strong", "Clarity: 92%", "Hook: Detected"],
    },
  },
  {
    icon: Sparkles,
    title: "Improve",
    description: "Content is restructured and enhanced automatically.",
    preview: {
      type: "improvement",
      before: "We launched a new feature...",
      after: "🚀 Just shipped: The feature you've been asking for...",
    },
  },
  {
    icon: Send,
    title: "Generate",
    description: "Get platform-ready posts and scripts instantly.",
    preview: {
      type: "output",
      platforms: ["LinkedIn", "X", "Threads"],
    },
  },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  // Preview components for each step type
  const renderPreview = (step: typeof steps[0]) => {
    switch (step.preview.type) {
      case "input":
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            className="rounded-lg border border-border bg-secondary/50 p-4"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <div className="h-2 w-2 rounded-full bg-primary/50" />
              Input detected
            </div>
            <p className="text-sm text-foreground">{step.preview.content}</p>
          </motion.div>
        );
      case "analysis":
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            className="space-y-2"
          >
            {step.preview.metrics?.map((metric, i) => (
              <motion.div
                key={metric}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.3, ease: "easeOut" }}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-2"
              >
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{metric}</span>
              </motion.div>
            ))}
          </motion.div>
        );
      case "improvement":
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="text-xs text-muted-foreground mb-1">Before</div>
              <p className="text-sm text-muted-foreground line-through">{step.preview.before}</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="text-xs text-primary mb-1">After</div>
              <p className="text-sm text-foreground">{step.preview.after}</p>
            </div>
          </motion.div>
        );
      case "output":
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            className="flex gap-2"
          >
            {step.preview.platforms?.map((platform, i) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.3, ease: "easeOut" }}
                className="flex-1 rounded-lg border border-border bg-secondary/50 p-3 text-center"
              >
                <div className="text-xs text-muted-foreground mb-1">Ready for</div>
                <div className="text-sm font-medium text-foreground">{platform}</div>
              </motion.div>
            ))}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative border-t border-border py-24 sm:py-32"
    >
      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
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

        <div className="mx-auto mt-16 max-w-4xl">
          {/* Stepper Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative mb-12"
          >
            {/* Step indicators */}
            <div className="relative flex justify-between">
              {/* Progress track - positioned at icon center (h-14 = 56px, center = 28px) */}
              <div className="absolute left-[28px] right-[28px] top-[28px] h-1 -translate-y-1/2 rounded-full bg-secondary" />
              
              {/* Animated progress line */}
              <motion.div
                className="absolute left-[28px] right-[28px] top-[28px] h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: activeStep / (steps.length - 1) }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ transformOrigin: "left" }}
              />

              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                const isUpcoming = index > activeStep;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className="group relative z-10 flex flex-col items-center"
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      opacity: isCompleted || isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Step circle */}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-lg"
                          : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                      style={isActive ? { boxShadow: "0 0 20px hsl(264, 100%, 65%, 0.4)" } : {}}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>

                    {/* Step title */}
                    <span
                      className={`mt-3 hidden text-sm font-medium transition-colors sm:block ${
                        isActive ? "text-primary" : isUpcoming ? "text-muted-foreground/50" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Content Card with horizontal slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-2xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* Icon + Title group */}
                <div className="flex items-start gap-4 md:w-1/3">
                  <motion.div
                    initial={{ rotate: -15, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                  >
                    {(() => {
                      const Icon = steps[activeStep].icon;
                      return <Icon className="h-7 w-7 text-primary" />;
                    })()}
                  </motion.div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Step {activeStep + 1}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {steps[activeStep].title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {steps[activeStep].description}
                    </p>
                  </div>
                </div>

                {/* Preview area */}
                <div className="md:w-2/3">
                  {renderPreview(steps[activeStep])}
                </div>
              </div>

              {/* Step navigation dots */}
              <div className="mt-6 flex justify-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeStep
                        ? "w-8 bg-primary"
                        : index < activeStep
                        ? "w-2 bg-primary/50"
                        : "w-2 bg-muted hover:bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {activeStep + 1} of {steps.length}
            </span>
            
            <Button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStep === steps.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
