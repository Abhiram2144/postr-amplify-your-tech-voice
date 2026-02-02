import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

// Animated line chart component
const AnimatedChart = ({ 
  data, 
  color, 
  isInView, 
  delay = 0,
  increasing = false 
}: { 
  data: number[], 
  color: string,
  isInView: boolean,
  delay?: number,
  increasing?: boolean
}) => {
  const progress = useMotionValue(0);
  
  useEffect(() => {
    if (isInView) {
      animate(progress, 1, { 
        duration: 2, 
        delay,
        ease: "easeOut" 
      });
    }
  }, [isInView, delay, progress]);

  const pathLength = useTransform(progress, [0, 1], [0, 1]);
  
  // Generate SVG path from data
  const width = 280;
  const height = 140;
  const padding = 20;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (value / 100) * (height - 2 * padding);
    return `${x},${y}`;
  });
  
  const pathD = `M ${points.join(' L ')}`;

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((_, i) => (
        <line
          key={i}
          x1={padding}
          y1={padding + (i / 4) * (height - 2 * padding)}
          x2={width - padding}
          y2={padding + (i / 4) * (height - 2 * padding)}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      ))}
      
      {/* Animated path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength }}
      />
      
      {/* Glow effect */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.2}
        style={{ pathLength }}
        filter="blur(4px)"
      />
      
      {/* Data points */}
      {data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (value / 100) * (height - 2 * padding);
        return (
          <motion.circle
            key={index}
            cx={x}
            cy={y}
            r={4}
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: delay + 0.5 + index * 0.1, duration: 0.3 }}
          />
        );
      })}
      
      {/* Labels */}
      <text x={padding} y={height - 4} fill="currentColor" opacity={0.5} fontSize={10}>
        Week 1
      </text>
      <text x={width - padding - 30} y={height - 4} fill="currentColor" opacity={0.5} fontSize={10}>
        Week 8
      </text>
    </svg>
  );
};

const BeforeAfterSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Decreasing retention data (before)
  const beforeData = [75, 68, 55, 48, 35, 28, 22, 18];
  
  // Increasing retention data (after)
  const afterData = [45, 52, 58, 65, 72, 78, 85, 92];

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(199,89%,48%,0.03),transparent_70%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            The difference
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            See the <span className="gradient-text">impact</span> on your audience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Consistent, quality content transforms engagement over time
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/5 to-card p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Before Postr</h3>
                <p className="text-sm text-muted-foreground">Inconsistent posting, generic content</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Audience Retention</div>
              <AnimatedChart 
                data={beforeData} 
                color="hsl(0, 84%, 60%)" 
                isInView={isInView}
                delay={0.4}
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Low engagement rates
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Inconsistent posting schedule
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Generic AI-sounding content
              </div>
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">After Postr</h3>
                <p className="text-sm text-muted-foreground">Consistent, engaging content</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-primary/20 bg-card/50 p-4">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Audience Retention</div>
              <AnimatedChart 
                data={afterData} 
                color="hsl(199, 89%, 48%)" 
                isInView={isInView}
                delay={0.6}
                increasing
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Higher engagement rates
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Regular posting across platforms
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Authentic, tech-focused voice
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-8"
        >
          {[
            { value: "3x", label: "More engagement" },
            { value: "50%", label: "Time saved" },
            { value: "7", label: "Platforms supported" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
