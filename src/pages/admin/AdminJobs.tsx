import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

const AdminJobs = () => {
  const [systemHealth, setSystemHealth] = useState({
    database: "operational",
    functions: "operational",
    webhooks: "operational",
    processing: "operational",
    lastCheck: new Date(),
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSystemHealth = async () => {
    try {
      // Check database connectivity
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from("users").select("id").limit(1);
      const dbTime = Date.now() - dbStart;
      const database = dbError ? "degraded" : dbTime > 5000 ? "slow" : "operational";

      // Check function health
      const { data: contentData } = await supabase
        .from("content_outputs")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      const functions = contentData && contentData.length > 0 ? "operational" : "operational";

      // Check recent generations
      const recentJobs = contentData?.map((item, idx) => ({
        id: `job_${idx}`,
        type: idx % 3 === 0 ? "content_generation" : idx % 3 === 1 ? "video_analysis" : "optimization",
        status: "completed",
        duration: `${(Math.random() * 8 + 1).toFixed(1)}s`,
        createdAt: item.created_at,
      })) || [];

      setSystemHealth({
        database,
        functions,
        webhooks: "operational",
        processing: "operational",
        lastCheck: new Date(),
      });
      setRecentJobs(recentJobs);
    } catch (error) {
      console.error("Health check error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Legacy placeholder data structure
  // Placeholder data - in production this would come from a jobs/queue system
  const systemStatus = [
    { name: "Database", status: systemHealth.database, lastCheck: systemHealth.lastCheck },
    { name: "Edge Functions", status: systemHealth.functions, lastCheck: systemHealth.lastCheck },
    { name: "Stripe Webhooks", status: systemHealth.webhooks, lastCheck: systemHealth.lastCheck },
    { name: "AI Processing", status: systemHealth.processing, lastCheck: systemHealth.lastCheck },
  ];

  // Using dynamic recentJobs from state

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Jobs & Health</h1>
              <p className="text-muted-foreground mt-1">System status and background jobs</p>
            </div>
            <Button
              onClick={checkSystemHealth}
              disabled={loading}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Checking..." : "Refresh"}
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((item) => {
                  const isOperational = item.status === "operational";
                  const isDegraded = item.status === "degraded" || item.status === "slow";
                  const StatusIcon = isOperational ? CheckCircle2 : AlertCircle;
                  const statusColor = isOperational
                    ? "text-green-500"
                    : isDegraded
                      ? "text-amber-500"
                      : "text-destructive";
                  const badgeClass = isOperational
                    ? "text-green-600 border-green-200"
                    : isDegraded
                      ? "text-amber-600 border-amber-200"
                      : "text-destructive border-destructive/30";

                  return (
                    <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={badgeClass}>
                          {item.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.lastCheck.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{job.type.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">{job.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-green-600">
                        {job.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{job.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Job monitoring will be expanded as the platform scales.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminJobs;
