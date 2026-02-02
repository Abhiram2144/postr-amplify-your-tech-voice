import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play } from "lucide-react";
import { Link } from "react-router-dom";

// Platform icons
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

// Floating Post Mockups
const LinkedInPost = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 0.15, y: 0 }}
    transition={{ duration: 0.8, delay: 0.5 }}
    className={`absolute w-48 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-sm ${className}`}
  >
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-full bg-white/30" />
      <div className="flex-1">
        <div className="h-2 w-16 rounded bg-white/30" />
        <div className="mt-1 h-1.5 w-12 rounded bg-white/20" />
      </div>
      <LinkedInIcon />
    </div>
    <div className="mt-3 space-y-1.5">
      <div className="h-2 w-full rounded bg-white/25" />
      <div className="h-2 w-4/5 rounded bg-white/25" />
      <div className="h-2 w-3/5 rounded bg-white/20" />
    </div>
    <div className="mt-3 flex items-center gap-3 text-white/40">
      <Heart className="h-3 w-3" />
      <MessageCircle className="h-3 w-3" />
      <Share2 className="h-3 w-3" />
    </div>
  </motion.div>
);

const XPost = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 0.15, y: 0 }}
    transition={{ duration: 0.8, delay: 0.6 }}
    className={`absolute w-44 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm ${className}`}
  >
    <div className="flex items-start gap-2">
      <div className="h-5 w-5 rounded-full bg-white/30" />
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <div className="h-2 w-12 rounded bg-white/30" />
          <XIcon />
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full rounded bg-white/25" />
          <div className="h-1.5 w-full rounded bg-white/25" />
          <div className="h-1.5 w-2/3 rounded bg-white/20" />
        </div>
        <div className="mt-2 flex items-center gap-4 text-white/40">
          <MessageCircle className="h-2.5 w-2.5" />
          <Share2 className="h-2.5 w-2.5" />
          <Heart className="h-2.5 w-2.5" />
          <Bookmark className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  </motion.div>
);

const ReelPost = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 0.15, x: 0 }}
    transition={{ duration: 0.8, delay: 0.7 }}
    className={`absolute w-28 rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-sm ${className}`}
  >
    <div className="relative aspect-[9/16] rounded-lg bg-white/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="h-6 w-6 text-white/30" fill="currentColor" />
      </div>
      <div className="absolute right-1 top-1">
        <InstagramIcon />
      </div>
    </div>
    <div className="mt-2 flex items-center justify-between text-white/40">
      <Heart className="h-3 w-3" />
      <MessageCircle className="h-3 w-3" />
      <Share2 className="h-3 w-3" />
      <MoreHorizontal className="h-3 w-3" />
    </div>
  </motion.div>
);

const TikTokPost = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 0.15, x: 0 }}
    transition={{ duration: 0.8, delay: 0.8 }}
    className={`absolute w-28 rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-sm ${className}`}
  >
    <div className="relative aspect-[9/16] rounded-lg bg-white/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="h-6 w-6 text-white/30" fill="currentColor" />
      </div>
      <div className="absolute right-1 top-1">
        <TikTokIcon />
      </div>
    </div>
    <div className="mt-2 flex items-center gap-2">
      <div className="h-4 w-4 rounded-full bg-white/30" />
      <div className="h-1.5 w-12 rounded bg-white/25" />
    </div>
  </motion.div>
);

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Solid light blue background for CTA block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/90 px-8 py-16 sm:px-16 sm:py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0,0%,100%,0.1),transparent_50%)]" />
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          {/* Floating Platform Posts - Hidden on mobile for cleaner look */}
          <div className="pointer-events-none hidden lg:block">
            <LinkedInPost className="-left-4 top-8 -rotate-6" />
            <XPost className="-right-2 top-4 rotate-6" />
            <ReelPost className="-bottom-4 left-16 rotate-3" />
            <TikTokPost className="-bottom-2 right-20 -rotate-3" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-black tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
            >
              Stop rewriting the same idea four times.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-lg text-primary-foreground/80"
            >
              Join thousands of tech creators who save hours every week with Postr.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="xl"
                  asChild
                  className="bg-white text-primary shadow-lg hover:bg-white/90"
                >
                  <Link to="/signup">
                    Start using Postr for free
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              <p className="text-sm text-primary-foreground/70">
                No credit card required · Free plan available
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
