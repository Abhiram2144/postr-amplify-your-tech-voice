import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileText, Video, Users } from "lucide-react";

interface UsageStats {
  totalGenerations: number;
  totalVideos: number;
  averagePerUser: number;
  topUsers: Array<{ email: string; count: number }>;
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

const AdminUsage = () => {
  const [stats, setStats] = useState<UsageStats>({
    totalGenerations: 0,
    totalVideos: 0,
    averagePerUser: 0,
    topUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // Fetch usage logs
        const { data: logs, error: logsError } = await supabase
          .from("usage_logs")
          .select("action, units, user_id");

        if (logsError) throw logsError;

        // Fetch users for email lookup
        const { data: users } = await supabase
          .from("users")
          .select("id, email");

        const userMap = new Map(users?.map(u => [u.id, u.email]) || []);

        // Calculate stats
        const totalGenerations = logs?.filter(l => l.action === "generation").reduce((sum, l) => sum + (l.units || 1), 0) || 0;
        const totalVideos = logs?.filter(l => l.action === "video").reduce((sum, l) => sum + (l.units || 1), 0) || 0;

        // Calculate per-user usage
        const userUsage = new Map<string, number>();
        logs?.forEach(log => {
          if (log.user_id) {
            userUsage.set(log.user_id, (userUsage.get(log.user_id) || 0) + (log.units || 1));
          }
        });

        const averagePerUser = userUsage.size > 0 
          ? Math.round((totalGenerations + totalVideos) / userUsage.size) 
          : 0;

        // Get top users
        const topUsers = Array.from(userUsage.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([userId, count]) => ({
            email: userMap.get(userId) || "Unknown",
            count,
          }));

        setStats({
          totalGenerations,
          totalVideos,
          averagePerUser,
          topUsers,
        });
      } catch (error) {
        console.error("Error fetching usage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Usage Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide usage statistics</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Text Generations
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalGenerations.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Video Analyses
              </CardTitle>
              <Video className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalVideos.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. per User
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.averagePerUser}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Users by Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : stats.topUsers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No usage data yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.topUsers.map((user, index) => {
                    const maxCount = stats.topUsers[0]?.count || 1;
                    const percentage = (user.count / maxCount) * 100;
                    
                    return (
                      <div key={user.email} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {index + 1}. {user.email}
                          </span>
                          <span className="font-medium">{user.count} actions</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminUsage;
