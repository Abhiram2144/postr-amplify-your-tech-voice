import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Frown, Layers, Bot, Award } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    text: "Writing posts takes too much time",
  },
  {
    icon: Frown,
    text: "Content feels boring or ignored",
  },
  {
    icon: Layers,
    text: "Each platform requires different formats",
  },
  {
    icon: Bot,
    text: "Generic AI tools create cringe content",
  },
  {
    icon: Award,
    text: "Creators want credibility, not hype",
  },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Posting consistently shouldn't feel harder than{" "}
              <span className="gradient-text">building software.</span>
            </h2>

            <div className="mt-10 space-y-4">
              {painPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-destructive/30 hover:bg-destructive/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <point.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {point.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Abstract Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square">
              {/* Abstract shapes */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-primary/10" />
                <div className="absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full bg-accent/10" />
              </motion.div>

              {/* Central element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-border bg-card shadow-xl">
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary">4x</div>
                    <div className="mt-1 text-sm text-muted-foreground">platforms</div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative dots */}
              <div className="absolute left-10 top-10 h-3 w-3 rounded-full bg-primary/40" />
              <div className="absolute right-20 top-20 h-2 w-2 rounded-full bg-accent/40" />
              <div className="absolute bottom-20 left-20 h-4 w-4 rounded-full bg-primary/30" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
