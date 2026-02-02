import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code, Lightbulb, GraduationCap, Briefcase } from "lucide-react";

const useCases = [
  {
    icon: Code,
    title: "Developers building in public",
    description:
      "Share your coding journey, technical decisions, and project updates with an engaged audience.",
  },
  {
    icon: GraduationCap,
    title: "Students sharing technical learnings",
    description:
      "Turn your study notes and project experiences into valuable content that builds your portfolio.",
  },
  {
    icon: Lightbulb,
    title: "Founders growing authority",
    description:
      "Establish thought leadership by sharing insights, challenges, and wins from building your company.",
  },
  {
    icon: Briefcase,
    title: "Engineers improving visibility",
    description:
      "Stand out in your field by consistently sharing your expertise and professional insights.",
  },
];

const UseCasesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(199,89%,48%,0.03),transparent_60%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Built for <span className="gradient-text">tech creators</span> like you
          </h2>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20"
                >
                  <useCase.icon className="h-6 w-6 text-primary" />
                </motion.div>

                <h3 className="mt-4 text-lg font-bold text-foreground">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
