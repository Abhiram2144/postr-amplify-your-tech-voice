import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsUsed: number;
  creditsLimit: number;
  currentPlan: string;
}

const InsufficientCreditsModal = ({
  open,
  onOpenChange,
  creditsUsed,
  creditsLimit,
  currentPlan,
}: InsufficientCreditsModalProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
          >
            <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </motion.div>
          <DialogTitle className="text-xl">You've Hit Your Limit!</DialogTitle>
          <DialogDescription className="text-center mt-2">
            You've used {creditsUsed} of {creditsLimit} monthly generations on your {currentPlan} plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Upgrade to get more credits:</p>
            
            <div className="space-y-2">
              {currentPlan === "free" && (
                <>
                  <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Creator</p>
                      <p className="text-xs text-muted-foreground">100 generations/month</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">$14/mo</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Pro</p>
                      <p className="text-xs text-muted-foreground">Unlimited generations</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-500">$29/mo</span>
                  </div>
                </>
              )}
              {currentPlan === "creator" && (
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Pro</p>
                    <p className="text-xs text-muted-foreground">Unlimited generations</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-500">$29/mo</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="hero" onClick={handleUpgrade} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientCreditsModal;
