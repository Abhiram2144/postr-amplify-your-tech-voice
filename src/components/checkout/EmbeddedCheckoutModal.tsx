import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EmbeddedCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceId: string;
  onSuccess?: () => void;
}

export const EmbeddedCheckoutModal = ({
  open,
  onOpenChange,
  priceId,
  onSuccess,
}: EmbeddedCheckoutModalProps) => {
  const { session } = useAuth();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    if (!session?.access_token || !priceId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: { priceId, embedded: false },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (data?.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else if (data?.url) {
        setCheckoutUrl(data.url);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize checkout");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, priceId]);

  useEffect(() => {
    if (open && priceId) {
      fetchClientSecret();
    } else {
      setCheckoutUrl(null);
      setError(null);
    }
  }, [open, priceId, fetchClientSecret]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Redirecting to secure checkout</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && checkoutUrl && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to Dodo Payments to complete your subscription.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};