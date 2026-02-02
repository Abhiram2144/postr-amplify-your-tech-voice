import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";

const comparisonData = {
  features: [
    "Transcription",
    "Structured Content Scoring",
    "Narrative Improvement / Advice",
    "Platform-Specific Post Generation",
    "Tech-Audience Optimization",
    "Built for Thought Leadership",
  ],
  competitors: [
    {
      name: "Castmagic",
      values: ["yes", "no", "no", "basic", "no", "no"],
    },
    {
      name: "Repurpose.io",
      values: ["no", "no", "no", "no", "no", "no"],
    },
    {
      name: "Quso.ai",
      values: ["yes", "no", "no", "visual", "no", "no"],
    },
    {
      name: "Predis.ai",
      values: ["no", "no", "no", "generic", "no", "no"],
    },
    {
      name: "Typical Social Tools",
      values: ["no", "limited", "no", "limited", "no", "no"],
    },
  ],
};

// Competitor logos as simple styled text badges
const CompetitorLogo = ({ name }: { name: string }) => {
  const colors: Record<string, string> = {
    "Castmagic": "bg-purple-100 text-purple-700",
    "Repurpose.io": "bg-blue-100 text-blue-700",
    "Quso.ai": "bg-emerald-100 text-emerald-700",
    "Predis.ai": "bg-orange-100 text-orange-700",
    "Typical Social Tools": "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${colors[name] || "bg-gray-100 text-gray-600"}`}>
      {name}
    </span>
  );
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
  // For partial values like "basic", "limited", "visual", "generic"
  return (
    <div className="flex items-center justify-center">
      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
        {value}
      </span>
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
            How Postr <span className="gradient-text">Stands Out</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-6xl overflow-x-auto rounded-2xl border border-border bg-card shadow-sm"
        >
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 text-left text-sm font-semibold text-foreground">
                  Feature
                </th>
                {comparisonData.competitors.map((competitor) => (
                  <th
                    key={competitor.name}
                    className="p-4 text-center"
                  >
                    <CompetitorLogo name={competitor.name} />
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
