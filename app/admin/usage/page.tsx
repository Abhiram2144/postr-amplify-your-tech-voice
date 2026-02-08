"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Video,
  Users,
  Zap,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminUsage() {
  const [stats, setStats] = useState<any>({
    totalGenerations: 0,
    totalVideos: 0,
    averagePerUser: 0,
    topUsers: [],
    totalCreditsAllocated: 0,
    totalCreditsUsed: 0,
    usersAtLimit: 0,
    usersNearLimit: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const { data: outputs } = await supabase
        .from("content_outputs")
        .select("generation_id, input_type, project_id");

      const { data: users } = await supabase
        .from("users")
        .select(
          "id, email, monthly_generation_limit, generations_used_this_month",
        );

      const userMap = new Map(users?.map((u) => [u.id, u.email]) || []);

      const textGenIds = new Set(
        outputs
          ?.filter((o: any) => o.input_type !== "video")
          .map((o: any) => o.generation_id),
      );
      const videoGenIds = new Set(
        outputs
          ?.filter((o: any) => o.input_type === "video")
          .map((o: any) => o.generation_id),
      );

      let totalAllocated = 0;
      let totalUsed = 0;
      let atLimit = 0;
      let nearLimit = 0;

      users?.forEach((u: any) => {
        const limit = u.monthly_generation_limit || 10;
        const used = u.generations_used_this_month || 0;
        totalAllocated += limit;
        totalUsed += used;
        if (used >= limit) atLimit++;
        else if (used >= limit * 0.8) nearLimit++;
      });

      setStats({
        totalGenerations: textGenIds.size,
        totalVideos: videoGenIds.size,
        averagePerUser: users?.length
          ? Math.round((textGenIds.size + videoGenIds.size) / users.length)
          : 0,
        totalCreditsAllocated: totalAllocated,
        totalCreditsUsed: totalUsed,
        usersAtLimit: atLimit,
        usersNearLimit: nearLimit,
        topUsers:
          users
            ?.sort(
              (a: any, b: any) =>
                (b.generations_used_this_month || 0) -
                (a.generations_used_this_month || 0),
            )
            .slice(0, 5) || [],
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
        <p className="text-slate-500 mt-1">
          Deep dive into platform-wide credit consumption.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          {
            label: "Text Generations",
            value: stats.totalGenerations,
            icon: FileText,
            color: "text-blue-500",
          },
          {
            label: "Video Analyses",
            value: stats.totalVideos,
            icon: Video,
            color: "text-purple-500",
          },
          {
            label: "Avg. per User",
            value: stats.averagePerUser,
            icon: Users,
            color: "text-emerald-500",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                {item.label}
              </span>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold">
              {loading ? "..." : item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Credit Distribution
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                  Allocated
                </p>
                <p className="text-xl font-bold">
                  {loading
                    ? "..."
                    : stats.totalCreditsAllocated.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                  Consumed
                </p>
                <p className="text-xl font-bold">
                  {loading ? "..." : stats.totalCreditsUsed.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500">Utilization Rate</span>
                <span className="font-bold text-rose-600">
                  {stats.totalCreditsAllocated > 0
                    ? Math.round(
                        (stats.totalCreditsUsed / stats.totalCreditsAllocated) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/30">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs font-bold text-red-800">
                      {stats.usersAtLimit} users
                    </p>
                    <p className="text-[10px] text-red-600">At Quota</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/30">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">
                      {stats.usersNearLimit} users
                    </p>
                    <p className="text-[10px] text-amber-600">Near Limit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Top Active Accounts
          </h3>
          <div className="space-y-4">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-50 animate-pulse rounded-lg"
                  />
                ))
              : stats.topUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.email}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {user.plan || "free"} project
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {user.generations_used_this_month}
                      </p>
                      <p className="text-[10px] text-slate-400">credits</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
