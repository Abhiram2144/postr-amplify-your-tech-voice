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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(199,89%,48%,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(187,92%,42%,0.04),transparent_60%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Stop rewriting the same idea{" "}
            <span className="gradient-text">four times.</span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground">
            Join thousands of tech creators who save hours every week with Postr.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <Button variant="hero" size="xl" asChild className="glow-effect">
              <Link to="/signup">
                Start using Postr for free
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              No credit card required · Free plan available
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;