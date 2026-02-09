import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Zap, PartyPopper, Rocket, X, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface CheckoutSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const CheckoutSuccessModal = ({ open, onClose }: CheckoutSuccessModalProps) => {
  const { plan, checkSubscription, loading } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(false);

  useEffect(() => {
    if (!open) return;

    let isActive = true;
    const refreshPlan = async () => {
      setCheckingPlan(true);
      await checkSubscription();
      if (isActive) {
        setCheckingPlan(false);
      }
    };

    refreshPlan();
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [open, checkSubscription]);

  const planDetails = {
    creator: {
      name: "Creator",
      credits: "100 ideas & 20 videos",
      icon: Sparkles,
      gradient: "from-primary to-accent",
      emoji: "🎨",
    },
    pro: {
      name: "Pro",
      credits: "Unlimited ideas & videos",
      icon: Trophy,
      gradient: "from-accent to-primary",
      emoji: "👑",
    },
    free: {
      name: "Free",
      credits: "5 ideas & 2 videos",
      icon: Zap,
      gradient: "from-muted to-muted-foreground",
      emoji: "⚡",
    },
  };

  const isLoadingPlan = loading || checkingPlan;
  const currentPlan = planDetails[plan] || planDetails.free;
  const Icon = currentPlan.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
              {/* Confetti animation */}
              <AnimatePresence>
                {showConfetti && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden z-0"
                  >
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          y: -20,
                          x: Math.random() * 400 - 200,
                          opacity: 1,
                          scale: 0,
                          rotate: 0,
                        }}
                        animate={{
                          y: 500,
                          opacity: 0,
                          scale: 1,
                          rotate: Math.random() * 720 - 360,
                        }}
                        transition={{
                          duration: 2.5 + Math.random() * 1.5,
                          delay: Math.random() * 0.5,
                          ease: "easeOut",
                        }}
                        className="absolute top-0"
                        style={{ left: `${Math.random() * 100}%` }}
                      >
                        <Sparkles
                          style={{
                            width: 10 + Math.random() * 14,
                            height: 10 + Math.random() * 14,
                            color: i % 3 === 0 
                              ? "hsl(var(--primary))" 
                              : i % 3 === 1 
                              ? "hsl(var(--accent))" 
                              : "hsl(45, 100%, 60%)",
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>

              <div className="relative p-6 pt-8 z-10">
                {/* Animated icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className={`mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br ${currentPlan.gradient} flex items-center justify-center shadow-xl shadow-primary/25`}
                >
                  <Icon className="h-10 w-10 text-primary-foreground" />
                </motion.div>

                {/* Title with party poppers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-center mb-6"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <motion.div
                      animate={{ rotate: [0, -15, 0] }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <PartyPopper className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Welcome to {currentPlan.name}!
                    </h2>
                    <motion.div
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <PartyPopper className="h-6 w-6 text-primary scale-x-[-1]" />
                    </motion.div>
                  </div>
                  <p className="text-muted-foreground">
                    Congratulations on upgrading your plan!
                  </p>
                </motion.div>

                {/* Credits display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-5 mb-6 text-center"
                >
                  <p className="text-sm text-muted-foreground mb-2">
                    Your new monthly allowance
                  </p>
                  {isLoadingPlan ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizing your plan...
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span className="text-2xl">{currentPlan.emoji}</span>
                      <p className="text-lg font-bold text-foreground">
                        {currentPlan.credits}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground text-center">
                    Good luck creating amazing content with Postr! 🚀
                  </p>
                  <Button
                    variant="hero"
                    className="w-full gap-2"
                    onClick={onClose}
                  >
                    <Rocket className="h-4 w-4" />
                    Start Creating
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutSuccessModal;
