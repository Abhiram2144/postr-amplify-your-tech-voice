import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
