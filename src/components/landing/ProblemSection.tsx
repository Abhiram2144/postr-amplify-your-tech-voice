import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Clock, Frown, Layers, Bot, Award } from "lucide-react";

// Platform icons
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.88-.73 2.082-1.168 3.479-1.27 1.015-.073 1.988-.009 2.896.166-.03-.593-.147-1.106-.352-1.522-.294-.597-.75-1.017-1.353-1.248-.896-.343-2.18-.346-3.076-.011-.897.336-1.143.845-1.186 1.065l-1.965-.46c.18-.769.63-1.755 1.925-2.438 1.319-.697 2.979-.725 4.455-.085 1.015.44 1.81 1.152 2.298 2.063.39.727.61 1.56.67 2.494.827.312 1.556.737 2.16 1.271 1.07.945 1.776 2.175 2.045 3.56.396 2.043-.07 4.128-1.314 5.865C18.594 22.262 15.96 24 12.186 24zm-.09-5.903c1.01-.054 1.728-.412 2.192-1.092.362-.533.617-1.27.717-2.18-.776-.157-1.6-.236-2.453-.193-.96.048-1.752.318-2.29.78-.502.43-.725.976-.684 1.576.04.574.347 1.06.866 1.368.538.32 1.207.478 1.93.478.242 0 .489-.015.722-.037z" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const floatingPlatforms = [
  { icon: LinkedInIcon, color: "text-[#0A66C2]", initialX: -120, initialY: -80 },
  { icon: XIcon, color: "text-foreground", initialX: 100, initialY: -100 },
  { icon: ThreadsIcon, color: "text-foreground", initialX: 130, initialY: 20 },
  { icon: RedditIcon, color: "text-[#FF4500]", initialX: -100, initialY: 90 },
  { icon: InstagramIcon, color: "text-[#E4405F]", initialX: 80, initialY: 110 },
  { icon: YouTubeIcon, color: "text-[#FF0000]", initialX: -140, initialY: 10 },
  { icon: TikTokIcon, color: "text-foreground", initialX: 10, initialY: -120 },
];

const painPoints = [
  { icon: Clock, text: "Writing posts takes too much time" },
  { icon: Frown, text: "Content feels boring or ignored" },
  { icon: Layers, text: "Each platform requires different formats" },
  { icon: Bot, text: "Generic AI tools create cringe content" },
  { icon: Award, text: "Creators want credibility, not hype" },
];

const FloatingIcon = ({ 
  icon: Icon, 
  color, 
  initialX, 
  initialY 
}: { 
  icon: React.FC; 
  color: string; 
  initialX: number; 
  initialY: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: initialX, y: initialY });

  const handleHover = () => {
    setIsHovered(true);
    // Move away from cursor in a random direction
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 40;
    setPosition({
      x: position.x + Math.cos(angle) * distance,
      y: position.y + Math.sin(angle) * distance,
    });
    setTimeout(() => setIsHovered(false), 500);
  };

  return (
    <motion.div
      className={`absolute cursor-pointer ${color}`}
      initial={{ x: initialX, y: initialY, opacity: 0 }}
      animate={{
        x: position.x,
        y: position.y,
        opacity: 1,
        scale: isHovered ? 0.8 : 1,
      }}
      transition={{
        x: { type: "spring", stiffness: 100, damping: 15 },
        y: { type: "spring", stiffness: 100, damping: 15 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.2 },
      }}
      onMouseEnter={handleHover}
      style={{ left: "50%", top: "50%" }}
    >
      <motion.div
        animate={{
          x: [0, Math.random() * 10 - 5, 0],
          y: [0, Math.random() * 10 - 5, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-xl border border-border bg-card p-3 shadow-lg transition-shadow hover:shadow-xl"
      >
        <Icon />
      </motion.div>
    </motion.div>
  );
};

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

          {/* Right - Interactive Floating Icons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square">
              {/* Floating platform icons */}
              {floatingPlatforms.map((platform, index) => (
                <FloatingIcon
                  key={index}
                  icon={platform.icon}
                  color={platform.color}
                  initialX={platform.initialX}
                  initialY={platform.initialY}
                />
              ))}

              {/* Central element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-border bg-card shadow-xl">
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary">7x</div>
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