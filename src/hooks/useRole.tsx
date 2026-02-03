import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = "user" | "admin";

interface RoleContextType {
  role: AppRole;
  isAdmin: boolean;
  loading: boolean;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);

  const refreshRole = useCallback(async () => {
    if (!user) {
      setRole("user");
      setLoading(false);
      return;
    }

    try {
      // Query user_roles table directly since RLS allows users to read their own roles
      // Using type assertion since user_roles may not be in generated types yet
      const { data, error } = await (supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .order("role")
        .limit(10) as any);

      if (error) {
        console.error("Error fetching role:", error);
        setRole("user");
      } else if (data && data.length > 0) {
        // Check if any role is admin
        const hasAdmin = data.some((r: { role: string }) => r.role === "admin");
        setRole(hasAdmin ? "admin" : "user");
      } else {
        setRole("user");
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole("user");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshRole();
  }, [refreshRole]);

  return (
    <RoleContext.Provider
      value={{
        role,
        isAdmin: role === "admin",
        loading,
        refreshRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
