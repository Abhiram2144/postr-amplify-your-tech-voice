"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

type AppRole = "user" | "admin";

// Force re-compile
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
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .order("role")
        .limit(1);

      if (error) {
        console.error("Error fetching role:", error);
        setRole("user");
      } else if (data && data.length > 0) {
        const hasAdmin = data.some((r: any) => r.role === "admin");
        if (hasAdmin) {
          setRole("admin");
          // If we are on the root page, redirect to admin immediately
          if (window.location.pathname === "/") {
            window.location.href = "/admin";
          }
        } else {
          setRole("user");
        }
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
