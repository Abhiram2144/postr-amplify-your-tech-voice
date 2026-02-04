import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Zap, Crown, X, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsUsed: number;
  creditsLimit: number;
  currentPlan: string;
}

const planUpgrades = {
  free: [
    {
      name: "Creator",
      credits: "100 generations/month",
      price: "$14",
      icon: Sparkles,
      gradient: "from-primary to-accent",
    },
    {
      name: "Pro",
      credits: "Unlimited generations",
      price: "$29",
      icon: Crown,
      gradient: "from-accent to-primary",
      highlight: true,
    },
  ],
  creator: [
    {
      name: "Pro",
      credits: "Unlimited generations",
      price: "$29",
      icon: Crown,
      gradient: "from-accent to-primary",
      highlight: true,
    },
  ],
};

const InsufficientCreditsModal = ({
  open,
  onOpenChange,
  creditsUsed,
  creditsLimit,
  currentPlan,
}: InsufficientCreditsModalProps) => {
  const navigate = useNavigate();
  const normalizedPlan = currentPlan.toLowerCase() as keyof typeof planUpgrades;
  const upgrades = planUpgrades[normalizedPlan] || planUpgrades.free;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

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
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-primary/5 pointer-events-none" />
              
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
                  className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20"
                >
                  <Zap className="h-8 w-8 text-white" />
                </motion.div>

                {/* Title & Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    You've Hit Your Limit!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    You've used{" "}
                    <span className="font-semibold text-foreground">{creditsUsed}</span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">{creditsLimit}</span>{" "}
                    monthly generations on your{" "}
                    <span className="font-semibold capitalize text-primary">{currentPlan}</span>{" "}
                    plan.
                  </p>
                </motion.div>

                {/* Usage bar */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Upgrade options */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-muted/50 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Upgrade to get more
                    </p>
                  </div>
                  <div className="space-y-2">
                    {upgrades.map((plan, index) => {
                      const Icon = plan.icon;
                      return (
                        <motion.div
                          key={plan.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                            plan.highlight
                              ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40"
                              : "bg-background/50 border-transparent hover:bg-background"
                          }`}
                          onClick={handleUpgrade}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.gradient}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{plan.name}</p>
                              <p className="text-xs text-muted-foreground">{plan.credits}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${
                            plan.highlight ? "text-primary" : "text-foreground"
                          }`}>
                            {plan.price}/mo
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
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Button
                    variant="hero"
                    className="w-full gap-2"
                    onClick={handleUpgrade}
                  >
                    <Sparkles className="h-4 w-4" />
                    Upgrade Now
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Maybe Later
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

export default InsufficientCreditsModal;
