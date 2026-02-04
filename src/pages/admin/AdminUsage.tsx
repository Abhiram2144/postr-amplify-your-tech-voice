import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileText, Video, Users, Zap, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UsageStats {
  totalGenerations: number;
  totalVideos: number;
  averagePerUser: number;
  topUsers: Array<{ email: string; count: number }>;
  totalCreditsAllocated: number;
  totalCreditsUsed: number;
  usersAtLimit: number;
  usersNearLimit: number;
  avgCreditConsumption: number;
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
    totalCreditsAllocated: 0,
    totalCreditsUsed: 0,
    usersAtLimit: 0,
    usersNearLimit: 0,
    avgCreditConsumption: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // Fetch content outputs to calculate usage
        const { data: outputs, error: outputsError } = await supabase
          .from("content_outputs")
          .select("generation_id, input_type, project_id");

        if (outputsError) throw outputsError;

        // Fetch users for email lookup
        const { data: users } = await supabase
          .from("users")
          .select("id, email");

        const userMap = new Map(users?.map(u => [u.id, u.email]) || []);

        // Count distinct generations (one credit per generation_id)
        const textGenerationIds = new Set<string>();
        const videoGenerationIds = new Set<string>();

        outputs?.forEach((row) => {
          if (!row.generation_id) return;
          if (row.input_type === "video") {
            videoGenerationIds.add(row.generation_id);
          } else {
            textGenerationIds.add(row.generation_id);
          }
        });

        const totalGenerations = textGenerationIds.size;
        const totalVideos = videoGenerationIds.size;

        // Calculate per-user usage (by project owner via project_id lookup)
        const userUsage = new Map<string, number>();
        const projectOwners = new Map<string, string>();

        if (outputs && outputs.length > 0) {
          const projectIds = Array.from(new Set(outputs.map(o => o.project_id).filter(Boolean) as string[]));
          if (projectIds.length > 0) {
            const { data: projects } = await supabase
              .from("projects")
              .select("id, user_id")
              .in("id", projectIds);

            projects?.forEach((p) => {
              projectOwners.set(p.id, p.user_id);
            });
          }
        }

        outputs?.forEach((row) => {
          if (!row.project_id) return;
          const ownerId = projectOwners.get(row.project_id);
          if (!ownerId) return;
          const key = `${ownerId}:${row.generation_id}`;
          if (row.input_type === "video") {
            userUsage.set(key, 1);
          } else {
            userUsage.set(key, 1);
          }
        });

        const perUserCounts = new Map<string, number>();
        Array.from(userUsage.keys()).forEach((key) => {
          const [userId] = key.split(":");
          perUserCounts.set(userId, (perUserCounts.get(userId) || 0) + 1);
        });

        const averagePerUser = perUserCounts.size > 0 
          ? Math.round((totalGenerations + totalVideos) / perUserCounts.size) 
          : 0;

        // Get top users
        const topUsers = Array.from(perUserCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([userId, count]) => ({
            email: userMap.get(userId) || "Unknown",
            count,
          }));

        // Fetch user credit allocation and usage
        const { data: creditData } = await supabase
          .from("users")
          .select("monthly_generation_limit, generations_used_this_month");

        let totalCreditsAllocated = 0;
        let totalCreditsUsed = 0;
        let usersAtLimit = 0;
        let usersNearLimit = 0;

        creditData?.forEach(user => {
          totalCreditsAllocated += user.monthly_generation_limit || 10;
          totalCreditsUsed += user.generations_used_this_month || 0;
          const limit = user.monthly_generation_limit || 10;
          const used = user.generations_used_this_month || 0;
          if (used >= limit) usersAtLimit++;
          if (used > 0 && used >= limit * 0.8) usersNearLimit++;
        });

        const avgCreditConsumption = creditData?.length ? Math.round(totalCreditsUsed / creditData.length) : 0;

        setStats({
          totalGenerations,
          totalVideos,
          averagePerUser,
          topUsers,
          totalCreditsAllocated,
          totalCreditsUsed,
          usersAtLimit,
          usersNearLimit,
          avgCreditConsumption,
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

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Allocated
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalCreditsAllocated.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total monthly quota</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Used
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalCreditsUsed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round((stats.totalCreditsUsed / Math.max(stats.totalCreditsAllocated, 1)) * 100)}% utilization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Users at Limit
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.usersAtLimit}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stats.usersNearLimit - stats.usersAtLimit} more near limit</p>
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
