import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalProjects: number;
  totalOutputs: number;
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, projectsRes, outputsRes] = await Promise.all([
          supabase.from("users").select("id, plan", { count: "exact" }),
          supabase.from("projects").select("id", { count: "exact" }),
          supabase.from("content_outputs").select("id", { count: "exact" }),
        ]);

        const totalUsers = usersRes.count || 0;
        const activeSubscribers = usersRes.data?.filter(u => u.plan !== "free").length || 0;
        const totalProjects = projectsRes.count || 0;
        const totalOutputs = outputsRes.count || 0;

        setStats({ totalUsers, activeSubscribers, totalProjects, totalOutputs });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Paid Subscribers", value: stats.activeSubscribers, icon: TrendingUp, color: "text-green-500" },
    { label: "Total Projects", value: stats.totalProjects, icon: FileText, color: "text-purple-500" },
    { label: "Content Generated", value: stats.totalOutputs, icon: Activity, color: "text-orange-500" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">System health and key metrics</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
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
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Use the sidebar to navigate to different admin sections:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>Users</strong> - View and manage user accounts</li>
                <li><strong>Usage</strong> - Monitor platform usage and limits</li>
                <li><strong>Jobs / Health</strong> - Check system health and job status</li>
                <li><strong>Flags / Abuse</strong> - Review flagged content and abuse reports</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
