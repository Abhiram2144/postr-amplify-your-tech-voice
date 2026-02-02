import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Video,
  FileSearch,
  Lightbulb,
  FileText,
  Linkedin,
  Twitter,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";

const features = [
  { icon: Video, label: "Video to transcript extraction" },
  { icon: FileSearch, label: "Content structure and clarity analysis" },
  { icon: Lightbulb, label: "Hook and flow improvement advice" },
  { icon: FileText, label: "Enhanced script generation" },
  { icon: Linkedin, label: "LinkedIn post generation" },
  { icon: Twitter, label: "X thread generation" },
  { icon: MessageCircle, label: "Threads post generation" },
  { icon: MessagesSquare, label: "Reddit discussion format" },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(187,92%,42%,0.04),transparent_70%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">create and publish</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
                <feature.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {feature.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;