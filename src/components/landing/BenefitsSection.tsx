import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Brain, Code2, Globe, Zap } from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "Content intelligence, not templates",
    description:
      "Postr analyzes your thinking before generating content. It understands context, not just keywords.",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
  },
  {
    icon: Code2,
    title: "Built for tech audiences",
    description:
      "Clear explanations. Logical flow. No fluff. Content that resonates with developers and engineers.",
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-500/10 to-blue-600/10",
  },
  {
    icon: Globe,
    title: "Platform-native outputs",
    description:
      "LinkedIn, X, Threads, and Reddit all get different formats optimized for each platform's culture.",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/10",
  },
  {
    icon: Zap,
    title: "Save hours every week",
    description:
      "One idea becomes multiple high-quality posts. Stop rewriting the same content four times.",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-600/10",
  },
];

const Card3D = ({ benefit, index, isInView }: { benefit: typeof benefits[0]; index: number; isInView: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.1, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative cursor-pointer"
    >
      {/* Card container */}
      <motion.div
        animate={{
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative h-full overflow-hidden rounded-2xl border border-border/50 backdrop-blur-sm transition-colors duration-500 ease-out ${isHovered ? '' : 'bg-card/80'}`}
        style={{ 
          transformStyle: "preserve-3d",
          background: isHovered 
            ? `linear-gradient(135deg, ${benefit.gradient.includes('violet') ? 'hsl(270, 60%, 96%)' : benefit.gradient.includes('cyan') ? 'hsl(185, 60%, 96%)' : benefit.gradient.includes('emerald') ? 'hsl(160, 60%, 96%)' : 'hsl(35, 60%, 96%)'}, hsl(var(--card) / 0.8))`
            : undefined
        }}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: `linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 55%, transparent 60%)`,
            transform: "translateX(-100%)",
          }}
          animate={isHovered ? { transform: "translateX(100%)" } : { transform: "translateX(-100%)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative p-8" style={{ transform: "translateZ(40px)" }}>
          {/* Icon with gradient background */}
          <motion.div
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg`}
            style={{ transform: "translateZ(60px)" }}
          >
            <benefit.icon className="h-7 w-7 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h3 
            className="mt-6 text-xl font-bold text-foreground"
            style={{ transform: "translateZ(30px)" }}
          >
            {benefit.title}
          </motion.h3>

          {/* Description */}
          <motion.p 
            className="mt-3 leading-relaxed text-muted-foreground"
            style={{ transform: "translateZ(20px)" }}
          >
            {benefit.description}
          </motion.p>

          {/* Floating decorative elements */}
          <motion.div
            animate={isHovered ? { scale: 1.2, opacity: 0.6 } : { scale: 1, opacity: 0.3 }}
            transition={{ duration: 0.3 }}
            className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${benefit.gradient} blur-2xl`}
            style={{ transform: "translateZ(-10px)" }}
          />
        </div>

        {/* Bottom gradient accent */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      </motion.div>

      {/* 3D Shadow */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-2xl bg-black/20 blur-xl"
        animate={{
          scale: isHovered ? 0.95 : 0.9,
          y: isHovered ? 20 : 10,
          opacity: isHovered ? 0.3 : 0.15,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32" style={{ perspective: "1500px" }}>
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

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2" style={{ transformStyle: "preserve-3d" }}>
          {benefits.map((benefit, index) => (
            <Card3D key={index} benefit={benefit} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
