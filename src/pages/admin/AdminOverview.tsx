import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Zap,
  CreditCard,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalProjects: number;
  totalOutputs: number;
  totalCreditsUsed: number;
  totalCreditsAvailable: number;
  creditUsagePercentage: number;
  avgCreditsPerUser: number;
  usersNearLimit: number;
  revenueMonthly: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalProjects: 0,
    totalOutputs: 0,
    totalCreditsUsed: 0,
    totalCreditsAvailable: 0,
    creditUsagePercentage: 0,
    avgCreditsPerUser: 0,
    usersNearLimit: 0,
    revenueMonthly: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, email, plan, monthly_generation_limit, generations_used_this_month");

      const totalUsers = usersData?.length || 0;
      const activeSubscribers = usersData?.filter(u => u.plan !== "free").length || 0;
      let totalCreditsUsed = 0;
      let totalCreditsAvailable = 0;
      let usersNearLimit = 0;
      usersData?.forEach(user => {
        const used = user.generations_used_this_month || 0;
        const limit = user.monthly_generation_limit || 10;
        totalCreditsUsed += used;
        totalCreditsAvailable += limit;
        if (limit > 0 && (used / limit) > 0.8) {
          usersNearLimit++;
        }
      });
      const avgCreditsPerUser = totalUsers > 0 ? Math.round(totalCreditsUsed / totalUsers) : 0;
      const creditUsagePercentage = totalCreditsAvailable > 0 
        ? Math.round((totalCreditsUsed / totalCreditsAvailable) * 100) 
        : 0;
      const [projectsRes, outputsRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("content_outputs").select("id", { count: "exact" }),
      ]);
      const totalProjects = projectsRes.count || 0;
      const totalOutputs = outputsRes.count || 0;
      const creatorCount = usersData?.filter(u => u.plan === "creator").length || 0;
      const proCount = usersData?.filter(u => u.plan === "pro").length || 0;
      const revenueMonthly = (creatorCount * 29) + (proCount * 99);
      setStats({
        totalUsers,
        activeSubscribers,
        totalProjects,
        totalOutputs,
        totalCreditsUsed,
        totalCreditsAvailable,
        creditUsagePercentage,
        avgCreditsPerUser,
        usersNearLimit,
        revenueMonthly,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", badge: `${stats.activeSubscribers} paid` },
    { label: "Paid Subscribers", value: stats.activeSubscribers, icon: TrendingUp, color: "text-green-500", badge: `${((stats.activeSubscribers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% conversion` },
    { label: "Total Projects", value: stats.totalProjects, icon: FileText, color: "text-purple-500", badge: `${stats.totalOutputs} outputs` },
    { label: "Monthly Revenue", value: `$${stats.revenueMonthly}`, icon: CreditCard, color: "text-emerald-500", badge: "Estimated" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Overview</h1>
            <p className="text-muted-foreground mt-1">System health and key metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.badge}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Credits Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used Credits</span>
                  <span className="font-semibold">{loading ? "..." : `${stats.totalCreditsUsed.toLocaleString()} / ${stats.totalCreditsAvailable.toLocaleString()}`}</span>
                </div>
                <Progress 
                  value={stats.creditUsagePercentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {stats.creditUsagePercentage}% used
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Avg per User</p>
                  <p className="text-lg font-bold">{loading ? "..." : stats.avgCreditsPerUser}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Available</p>
                  <p className="text-lg font-bold">{loading ? "..." : stats.totalCreditsAvailable.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.usersNearLimit > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-200 dark:border-yellow-800"
                >
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {stats.usersNearLimit} user{stats.usersNearLimit > 1 ? "s" : ""} near credit limit
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    These users have used over 80% of their monthly quota
                  </p>
                </motion.div>
              )}
              {stats.creditUsagePercentage > 90 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-800"
                >
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    High overall credit usage
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    Platform is at {stats.creditUsagePercentage}% capacity
                  </p>
                </motion.div>
              )}
              {stats.usersNearLimit === 0 && stats.creditUsagePercentage <= 90 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    System operating normally
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    No critical alerts at this time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Use the sidebar to navigate to different admin sections:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Users</strong> - Manage accounts, plans, and credit allocations</li>
                <li><strong>Usage</strong> - Monitor credits usage and user activity patterns</li>
                <li><strong>Jobs / Health</strong> - Check system health and processing status</li>
                <li><strong>Flags / Abuse</strong> - Review and manage flagged content</li>
              </ul>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground pt-2 italic">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
