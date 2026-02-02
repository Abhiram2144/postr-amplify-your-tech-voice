import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Minus } from "lucide-react";

const comparisonData = {
  features: [
    "Built for tech creators",
    "Video understanding",
    "Content quality analysis",
    "Improvement advice",
    "Platform-specific formatting",
    "LinkedIn + X + Threads + Reddit",
    "Strategy before generation",
    "No-cringe, no-fluff output",
  ],
  competitors: [
    {
      name: "Generic AI Writers",
      values: ["no", "no", "no", "no", "partial", "partial", "no", "no"],
    },
    {
      name: "Repurposing Tools",
      values: ["no", "partial", "no", "no", "partial", "no", "no", "no"],
    },
    {
      name: "Social Schedulers",
      values: ["no", "no", "no", "no", "no", "partial", "no", "no"],
    },
  ],
};

const ValueCell = ({ value }: { value: string }) => {
  if (value === "yes") {
    return (
      <div className="flex items-center justify-center">
        <Check className="h-5 w-5 text-accent" />
      </div>
    );
  }
  if (value === "no") {
    return (
      <div className="flex items-center justify-center">
        <X className="h-5 w-5 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <Minus className="h-5 w-5 text-muted-foreground/40" />
    </div>
  );
};

const ComparisonSection = () => {
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
          <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
            Comparison
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Why Postr instead of{" "}
            <span className="gradient-text">generic AI tools?</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-5xl overflow-x-auto rounded-2xl border border-border bg-card shadow-sm"
        >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 text-left text-sm font-semibold text-foreground">
                  Feature
                </th>
                {comparisonData.competitors.map((competitor) => (
                  <th
                    key={competitor.name}
                    className="p-4 text-center text-sm font-medium text-muted-foreground"
                  >
                    {competitor.name}
                  </th>
                ))}
                <th className="bg-primary/10 p-4 text-center">
                  <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
                    Postr
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.features.map((feature, rowIndex) => (
                <motion.tr
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + rowIndex * 0.05 }}
                  className="group border-b border-border/50 transition-colors hover:bg-secondary/30"
                >
                  <td className="p-4 text-sm font-medium text-foreground">{feature}</td>
                  {comparisonData.competitors.map((competitor) => (
                    <td key={competitor.name} className="p-4">
                      <ValueCell value={competitor.values[rowIndex]} />
                    </td>
                  ))}
                  <td className="bg-primary/5 p-4 transition-colors group-hover:bg-primary/10">
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
