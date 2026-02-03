import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

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
  // Placeholder data - in production this would come from a jobs/queue system
  const systemStatus = [
    { name: "Edge Functions", status: "operational", lastCheck: "2 min ago" },
    { name: "Database", status: "operational", lastCheck: "1 min ago" },
    { name: "Stripe Webhooks", status: "operational", lastCheck: "5 min ago" },
    { name: "AI Processing", status: "operational", lastCheck: "3 min ago" },
  ];

  const recentJobs = [
    { id: "job_1", type: "content_generation", status: "completed", duration: "2.3s" },
    { id: "job_2", type: "video_analysis", status: "completed", duration: "8.1s" },
    { id: "job_3", type: "content_generation", status: "completed", duration: "1.9s" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Jobs & Health</h1>
          <p className="text-muted-foreground mt-1">System status and background jobs</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {item.status === "operational" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={item.status === "operational" ? "outline" : "destructive"}>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.lastCheck}
                      </span>
                    </div>
                  </div>
                ))}
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
