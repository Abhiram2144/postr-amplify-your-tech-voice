"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Double check admin role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .single();

          if (roleData) {
            toast.success("Identity Verified. Access granted.");
            // Force hard redirect to ensure admin layout loads
            window.location.href = "/admin";
          } else {
            toast.error("Unauthorized: Role mapping missing.");
            await supabase.auth.signOut();
            router.push("/auth/login");
          }
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">
          Synchronizing tokens...
        </p>
      </div>
    </div>
  );
}
