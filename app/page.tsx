"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/admin");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  return null; // No UI needed, useEffect handles redirect
}
