import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Crown } from "lucide-react";
import { getRewriteLimit } from "@/lib/rewrite-limits";

interface RewriteLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string | null;
  rewriteCount: number;
}

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Rewrite Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You've used all {limit} rewrites for this content on your{" "}
            <span className="font-medium capitalize">{currentPlan || "Free"}</span> plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Each piece of content has a limited number of rewrites based on your plan:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Free</span>
                <span className="font-medium">1 rewrite</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Creator</span>
                <span className="font-medium">3 rewrites</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Pro</span>
                <span className="font-medium">5 rewrites</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="hero"
              className="gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate("/pricing");
              }}
            >
              <Crown className="h-4 w-4" />
              Upgrade Plan
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can always duplicate this content to start fresh with new rewrite limits.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewriteLimitModal;
