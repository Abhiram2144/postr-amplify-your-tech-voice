import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Zap, PartyPopper } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface CheckoutSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const CheckoutSuccessModal = ({ open, onClose }: CheckoutSuccessModalProps) => {
  const { plan, checkSubscription } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      // Refresh subscription status when modal opens
      checkSubscription();
      setShowConfetti(true);
      
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, checkSubscription]);

  const planDetails = {
    creator: {
      name: "Creator",
      credits: "100 ideas & 20 videos",
      icon: Sparkles,
      gradient: "from-primary to-accent",
    },
    pro: {
      name: "Pro",
      credits: "Unlimited ideas & videos",
      icon: Trophy,
      gradient: "from-accent to-primary",
    },
    free: {
      name: "Free",
      credits: "5 ideas & 2 videos",
      icon: Zap,
      gradient: "from-muted to-muted-foreground",
    },
  };

  const currentPlan = planDetails[plan] || planDetails.free;
  const Icon = currentPlan.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {/* Animated confetti/sparkle elements */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: -20, 
                    x: Math.random() * 400 - 200,
                    opacity: 1,
                    scale: 0 
                  }}
                  animate={{ 
                    y: 400, 
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-0"
                  style={{ left: `${Math.random() * 100}%` }}
                >
                  <Sparkles 
                    className="text-primary" 
                    style={{ 
                      width: 8 + Math.random() * 16,
                      height: 8 + Math.random() * 16,
                      color: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'
                    }} 
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center text-center py-6 relative z-10">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${currentPlan.gradient} flex items-center justify-center mb-6 shadow-lg`}
          >
            <Icon className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2">
              <PartyPopper className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to {currentPlan.name}!
              </h2>
              <PartyPopper className="h-6 w-6 text-primary scale-x-[-1]" />
            </div>
            <p className="text-muted-foreground">
              Congratulations on upgrading your plan!
            </p>
          </motion.div>

          {/* Credits display with animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20"
          >
            <p className="text-sm text-muted-foreground mb-1">Your new monthly allowance</p>
            <motion.p 
              className="text-lg font-semibold text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {currentPlan.credits}
            </motion.p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 space-y-3 w-full"
          >
            <p className="text-sm text-muted-foreground">
              Good luck creating amazing content with Postr! 🚀
            </p>
            <Button 
              variant="hero" 
              className="w-full gap-2" 
              onClick={onClose}
            >
              <Sparkles className="h-4 w-4" />
              Start Creating
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutSuccessModal;
