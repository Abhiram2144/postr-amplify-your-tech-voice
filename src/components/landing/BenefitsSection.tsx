import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Code2, Globe, Zap } from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Content intelligence, not templates",
    description:
      "Postr analyzes your thinking before generating content. It understands context, not just keywords.",
  },
  {
    icon: Code2,
    title: "Built for tech audiences",
    description:
      "Clear explanations. Logical flow. No fluff. Content that resonates with developers and engineers.",
  },
  {
    icon: Globe,
    title: "Platform-native outputs",
    description:
      "LinkedIn, X, Threads, and Reddit all get different formats optimized for each platform's culture.",
  },
  {
    icon: Zap,
    title: "Save hours every week",
    description:
      "One idea becomes multiple high-quality posts. Stop rewriting the same content four times.",
  },
];

const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Intelligence that understands{" "}
            <span className="gradient-text">your thinking</span>
          </h2>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${
                index % 2 === 0
                  ? "border-primary/20 bg-primary/5 hover:border-primary/40"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                >
                  <benefit.icon className="h-6 w-6 text-primary" />
                </motion.div>

                <h3 className="mt-6 text-xl font-bold text-foreground">{benefit.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
