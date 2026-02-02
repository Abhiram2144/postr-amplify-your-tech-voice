import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code, Rocket, GraduationCap, Briefcase } from "lucide-react";

const useCases = [
  {
    icon: Code,
    title: "Developers building in public",
    description:
      "Share your coding journey, side projects, and technical insights with an engaged audience.",
  },
  {
    icon: GraduationCap,
    title: "Students sharing technical learnings",
    description:
      "Document what you learn and build your professional presence before graduation.",
  },
  {
    icon: Rocket,
    title: "Founders growing authority",
    description:
      "Position yourself as a thought leader while building your startup in the open.",
  },
  {
    icon: Briefcase,
    title: "Engineers improving visibility",
    description:
      "Stand out in your career by sharing your expertise and technical perspective.",
  },
];

const UseCasesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(217,91%,60%,0.08),transparent_50%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Use Cases
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Built for people who{" "}
            <span className="gradient-text">ship and share</span>
          </h2>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-accent/50"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <useCase.icon className="h-6 w-6 text-accent" />
              </div>

              <h3 className="mt-6 text-xl font-bold">{useCase.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;