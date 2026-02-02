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
  {
    icon: Video,
    title: "Video to transcript extraction",
    description: "Upload any video and get clean, accurate transcripts instantly.",
  },
  {
    icon: FileSearch,
    title: "Content structure analysis",
    description: "AI analyzes your content's structure, clarity, and logical flow.",
  },
  {
    icon: Lightbulb,
    title: "Hook improvement advice",
    description: "Get actionable suggestions to make your hooks more compelling.",
  },
  {
    icon: FileText,
    title: "Enhanced script generation",
    description: "Transform rough ideas into polished, ready-to-publish scripts.",
  },
];

const platforms = [
  { icon: Linkedin, name: "LinkedIn posts", color: "text-[#0A66C2]" },
  { icon: Twitter, name: "X threads", color: "text-foreground" },
  { icon: MessageCircle, name: "Threads posts", color: "text-foreground" },
  { icon: MessagesSquare, name: "Reddit discussions", color: "text-[#FF4500]" },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(187,92%,42%,0.03),transparent_70%)]" />

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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">create and publish</span>
          </h2>
        </motion.div>

        {/* Main Features - Alternating Layout */}
        <div className="mx-auto mt-16 max-w-5xl space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className={`flex flex-col items-center gap-8 md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Feature Visual */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex h-48 w-full items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 md:w-1/2"
              >
                <feature.icon className="h-20 w-20 text-primary/60" />
              </motion.div>

              {/* Feature Content */}
              <div className="w-full text-center md:w-1/2 md:text-left">
                <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-lg text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Outputs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <h3 className="text-center text-xl font-bold text-foreground">
            Generate content for all major platforms
          </h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
                  <platform.icon className={`h-6 w-6 ${platform.color} transition-colors group-hover:text-primary`} />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                  {platform.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
