import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const VIDEO_ACTIONS = ["generate_content_video_upload", "generate_content_video"] as const;

const startOfMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start, end };
};

export const useVideoUsage = () => {
  const { user } = useAuth();
  const [videoUsed, setVideoUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshVideoUsage = useCallback(async () => {
    if (!user?.id) {
      setVideoUsed(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { start, end } = startOfMonthRange(new Date());
      const { count, error } = await supabase
        .from("usage_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("action", VIDEO_ACTIONS as unknown as string[])
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

      if (error) throw error;
      setVideoUsed(count ?? 0);
    } catch (error) {
      console.error("Error fetching video usage:", error);
      setVideoUsed(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshVideoUsage();
  }, [refreshVideoUsage]);

  return { videoUsed, loading, refreshVideoUsage };
};
