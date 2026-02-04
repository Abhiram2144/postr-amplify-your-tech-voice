import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

type FlagItem = {
  id: string;
  platform: string | null;
  content_type: string | null;
  created_at: string | null;
  analysis_score: number | null;
  analysis_feedback: unknown | null;
  rewrite_count: number | null;
};

const AdminFlags = () => {
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openFlags: 0,
    highPriority: 0,
    reviewed30d: 0,
    rewrites30d: 0,
  });

  const scoreThreshold = 60;
  const highPriorityThreshold = 40;

  const normalizeScore = (score: number | null) => {
    if (score === null || score === undefined) return null;
    return score <= 1 ? score * 100 : score;
  };

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("content_outputs")
        .select("id, platform, content_type, created_at, analysis_score, analysis_feedback, rewrite_count")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const rows = (data ?? []) as FlagItem[];
      const withScores = rows.map((row) => ({
        ...row,
        analysis_score: normalizeScore(row.analysis_score),
      }));

      const openFlags = withScores.filter((row) =>
        row.analysis_score !== null && row.analysis_score < scoreThreshold
      );
      const highPriority = withScores.filter((row) =>
        row.analysis_score !== null && row.analysis_score < highPriorityThreshold
      );
      const reviewed30d = withScores.filter((row) => row.analysis_score !== null).length;
      const rewrites30d = withScores.filter((row) => (row.rewrite_count ?? 0) > 0).length;

      setFlags(openFlags.slice(0, 8));
      setStats({
        openFlags: openFlags.length,
        highPriority: highPriority.length,
        reviewed30d,
        rewrites30d,
      });
    } catch (error) {
      console.error("Error fetching flags:", error);
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const flaggingActive = useMemo(() => stats.reviewed30d > 0, [stats.reviewed30d]);

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
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Flags & Abuse</h1>
              <p className="text-muted-foreground mt-1">Review flagged content and abuse reports</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={flaggingActive ? "default" : "outline"}>
                {flaggingActive ? "Auto-flagging: Active" : "Auto-flagging: Inactive"}
              </Badge>
              <Button
                onClick={fetchFlags}
                disabled={loading}
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Flags
              </CardTitle>
              <Flag className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openFlags}</div>
              <p className="text-xs text-muted-foreground mt-1">Score below {scoreThreshold}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highPriority}</div>
              <p className="text-xs text-muted-foreground mt-1">Score below {highPriorityThreshold}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reviewed (30d)
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewed30d}</div>
              <p className="text-xs text-muted-foreground mt-1">Rewrites: {stats.rewrites30d}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              {flags.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-foreground">All clear!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No flagged content or abuse reports at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => {
                    const score = flag.analysis_score;
                    const severity = score !== null && score < highPriorityThreshold ? "High" : "Medium";
                    const badgeVariant = severity === "High" ? "destructive" : "outline";
                    const feedback = typeof flag.analysis_feedback === "string"
                      ? flag.analysis_feedback
                      : flag.analysis_feedback
                        ? JSON.stringify(flag.analysis_feedback)
                        : "No feedback provided";

                    return (
                      <div key={flag.id} className="flex items-start justify-between gap-4 border-b last:border-0 pb-3">
                        <div>
                          <p className="font-medium text-sm">
                            {flag.platform || "Unknown platform"} • {flag.content_type || "General"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {flag.created_at ? new Date(flag.created_at).toLocaleString() : "Unknown time"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{feedback}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={badgeVariant}>{severity} Priority</Badge>
                          <Badge variant="outline">
                            Score: {score !== null ? Math.round(score) : "N/A"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This view currently uses analysis signals to surface items for review. 
                Connect user reporting workflows to expand the queue with explicit abuse reports.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminFlags;
