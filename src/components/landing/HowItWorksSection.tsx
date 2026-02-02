import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Search, Sparkles, Send } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload or paste",
    description: "Drop a video or paste your text, script, or idea.",
  },
  {
    icon: Search,
    title: "Analyze",
    description: "Postr analyzes structure, clarity, and flow.",
  },
  {
    icon: Sparkles,
    title: "Improve",
    description: "Content is restructured and enhanced.",
  },
  {
    icon: Send,
    title: "Generate",
    description: "Get platform-ready posts instantly.",
  },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(199,89%,48%,0.04),transparent_70%)]" />

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
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            From idea to posts in{" "}
            <span className="gradient-text">four steps</span>
          </h2>
        </motion.div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative grid gap-8 md:grid-cols-4">
            {/* Connection Line */}
            <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background px-2 text-xs font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Icon */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-lg shadow-primary/5">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;