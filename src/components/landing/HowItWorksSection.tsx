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
          <div className="relative grid gap-6 md:grid-cols-4 md:gap-8">
            {/* Connection Line - animated */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute left-[12%] right-[12%] top-[52px] hidden h-0.5 origin-left bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block"
            />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.2 + index * 0.15,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.4 + index * 0.15, type: "spring" }}
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </motion.div>

                {/* Icon Card */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-lg transition-shadow hover:shadow-xl">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
