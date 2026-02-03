import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  const refreshRole = async () => {
    if (!user) {
      setRole("user");
      setLoading(false);
      return;
    }

    try {
      // Use RPC to call the security definer function
      const { data, error } = await supabase.rpc("get_user_role", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error fetching role:", error);
        setRole("user");
      } else {
        setRole((data as AppRole) || "user");
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRole();
  }, [user]);

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
