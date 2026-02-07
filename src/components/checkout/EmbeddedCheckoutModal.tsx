import { useState, useEffect, useCallback, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Use publishable key from environment - MUST match Stripe secret key environment (test/live)
const stripePromise = loadStripe("pk_live_51SwnpfH0ScE1y6GMNPp8yXfG8b69BHyX8KAbJsifnZA0v8eBrFpTmfADWNi7iNLyZQDSglNWJAjAdlQZ5VGxCKGP00hG9PZzRi");

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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
          body: { priceId, embedded: true },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else if (data?.url) {
        // Fallback to redirect if embedded not supported
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
      setClientSecret(null);
      setError(null);
    }
  }, [open, priceId, fetchClientSecret]);

  // Handle completion - close modal and trigger success callback
  const handleComplete = useCallback(() => {
    onOpenChange(false);
    onSuccess?.();
  }, [onOpenChange, onSuccess]);

  // IMPORTANT: Memoize options to prevent React warning about prop changes
  // EmbeddedCheckoutProvider requires stable options reference
  const checkoutOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      onComplete: handleComplete,
    };
  }, [clientSecret, handleComplete]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Complete your subscription</DialogTitle>
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

          {checkoutOptions && !loading && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={checkoutOptions}
            >
              <EmbeddedCheckout className="min-h-[400px]" />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};