"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminStore } from "@/store/adminStore";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminOverview() {
  const { stats, setStats, loading, setLoading } = useAdminStore();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: usersData } = await supabase
        .from("users")
        .select(
          "id, email, plan, monthly_generation_limit, generations_used_this_month",
        );

      const totalUsers = usersData?.length || 0;
      const activeSubscribers =
        usersData?.filter((u: any) => u.plan !== "free").length || 0;

      let totalCreditsUsed = 0;
      let totalCreditsAvailable = 0;
      let usersNearLimit = 0;

      usersData?.forEach((user: any) => {
        const used = user.generations_used_this_month || 0;
        const limit = user.monthly_generation_limit || 10;
        totalCreditsUsed += used;
        totalCreditsAvailable += limit;
        if (limit > 0 && used / limit > 0.8) {
          usersNearLimit++;
        }
      });

      const [projectsRes, outputsRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("content_outputs").select("id", { count: "exact" }),
      ]);

      const creatorCount =
        usersData?.filter((u: any) => u.plan === "creator").length || 0;
      const proCount =
        usersData?.filter((u: any) => u.plan === "pro").length || 0;
      const revenueMonthly = creatorCount * 29 + proCount * 99;

      setStats({
        totalUsers,
        activeSubscribers,
        totalProjects: projectsRes.count || 0,
        totalOutputs: outputsRes.count || 0,
        totalCreditsUsed,
        totalCreditsAvailable,
        creditUsagePercentage:
          totalCreditsAvailable > 0
            ? Math.round((totalCreditsUsed / totalCreditsAvailable) * 100)
            : 0,
        avgCreditsPerUser:
          totalUsers > 0 ? Math.round(totalCreditsUsed / totalUsers) : 0,
        usersNearLimit,
        revenueMonthly,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      badge: `${stats.activeSubscribers} paid`,
    },
    {
      label: "Subscribers",
      value: stats.activeSubscribers,
      icon: TrendingUp,
      color: "text-green-500",
      badge: `${((stats.activeSubscribers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% conversion`,
    },
    {
      label: "Projects",
      value: stats.totalProjects,
      icon: FileText,
      color: "text-purple-500",
      badge: `${stats.totalOutputs} outputs`,
    },
    {
      label: "Revenue",
      value: `$${stats.revenueMonthly}`,
      icon: CreditCard,
      color: "text-emerald-500",
      badge: "Estimated MRR",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-slate-500 mt-1">
              Platform metrics and system health monitoring.
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.value.toLocaleString()}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-400">
                  {stat.badge}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            variants={itemVariants}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-amber-500" />
              Credits Distribution
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Total Consumption</span>
                  <span className="font-semibold text-slate-900">
                    {stats.totalCreditsUsed.toLocaleString()} /{" "}
                    {stats.totalCreditsAvailable.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.creditUsagePercentage}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-xs text-slate-400">
                  {stats.creditUsagePercentage}% utilization
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Avg per User</p>
                  <p className="text-xl font-bold text-slate-900">
                    {stats.avgCreditsPerUser}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Capacity</p>
                  <p className="text-xl font-bold text-slate-900">
                    {stats.totalCreditsAvailable.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Intelligence Center
            </h3>
            <div className="space-y-4">
              {stats.usersNearLimit > 0 ? (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-sm font-semibold text-amber-800">
                    Quota Alert
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {stats.usersNearLimit} users have exceeded 80% of their
                    monthly credits.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-800">
                    All Systems Nominal
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    No critical capacity issues detected across user segments.
                  </p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 italic">
                  Last automated sync:{" "}
                  {lastUpdated?.toLocaleTimeString() || "Never"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
