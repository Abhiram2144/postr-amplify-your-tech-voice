import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap } from "lucide-react";

const CreditsIndicator = () => {
  const { creditsUsed, creditsLimit, creditsRemaining, loading } = useCredits();
  const { plan } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg animate-pulse">
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
    );
  }

  const percentage = Math.min(100, (creditsUsed / creditsLimit) * 100);
  const isLow = percentage >= 80;
  const isExhausted = creditsRemaining === 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
          isExhausted 
            ? "bg-destructive/10 border-destructive/30" 
            : isLow 
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-muted/50 border-transparent"
        }`}>
          <Zap className={`h-4 w-4 ${
            isExhausted 
              ? "text-destructive" 
              : isLow 
              ? "text-amber-500" 
              : "text-primary"
          }`} />
          <span className="text-sm font-medium">
            {creditsRemaining}/{creditsLimit}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <div className="space-y-2">
          <p className="font-medium">Monthly Credits</p>
          <Progress value={percentage} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {creditsUsed} used of {creditsLimit} ({plan} plan)
          </p>
          {isExhausted && (
            <p className="text-xs text-destructive">Upgrade for more credits!</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default CreditsIndicator;
