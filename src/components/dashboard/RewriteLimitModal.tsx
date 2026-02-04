import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Crown, Sparkles, X } from "lucide-react";
import { getRewriteLimit } from "@/lib/rewrite-limits";

interface RewriteLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string | null;
  rewriteCount: number;
}

const planTiers = [
  { name: "Free", rewrites: 1, highlight: false },
  { name: "Creator", rewrites: 2, highlight: false },
  { name: "Pro", rewrites: 3, highlight: true },
];

const RewriteLimitModal = ({
  open,
  onOpenChange,
  currentPlan,
  rewriteCount,
}: RewriteLimitModalProps) => {
  const navigate = useNavigate();
  const limit = getRewriteLimit(currentPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>

              <div className="relative p-6 pt-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  <RefreshCw className="h-8 w-8 text-primary-foreground" />
                </motion.div>

                {/* Title & Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Rewrite Limit Reached
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    You've used all{" "}
                    <span className="font-semibold text-foreground">{limit}</span>{" "}
                    rewrites for this content on your{" "}
                    <span className="font-semibold capitalize text-primary">
                      {currentPlan || "Free"}
                    </span>{" "}
                    plan.
                  </p>
                </motion.div>

                {/* Plan tiers */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-muted/50 rounded-xl p-4 mb-6"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Rewrites per content
                  </p>
                  <div className="space-y-2">
                    {planTiers.map((tier, index) => {
                      const isCurrentPlan = tier.name.toLowerCase() === (currentPlan || "free").toLowerCase();
                      return (
                        <motion.div
                          key={tier.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + index * 0.05 }}
                          className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                            isCurrentPlan
                              ? "bg-primary/10 border border-primary/20"
                              : tier.highlight
                              ? "bg-accent/5 border border-accent/10"
                              : "bg-background/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {tier.highlight ? (
                              <Crown className="h-4 w-4 text-accent" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={`text-sm font-medium ${
                              isCurrentPlan ? "text-primary" : "text-foreground"
                            }`}>
                              {tier.name}
                              {isCurrentPlan && (
                                <span className="ml-2 text-xs text-muted-foreground">(current)</span>
                              )}
                            </span>
                          </div>
                          <span className={`text-sm font-bold ${
                            tier.highlight ? "text-accent" : "text-foreground"
                          }`}>
                            {tier.rewrites} {tier.rewrites === 1 ? "rewrite" : "rewrites"}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-2"
                >
                  <Button
                    variant="hero"
                    className="w-full gap-2"
                    onClick={() => {
                      onOpenChange(false);
                      navigate("/pricing");
                    }}
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Maybe Later
                  </Button>
                </motion.div>

                {/* Tip */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-muted-foreground text-center mt-4"
                >
                  💡 Duplicate this content to start fresh with new rewrite limits.
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RewriteLimitModal;
