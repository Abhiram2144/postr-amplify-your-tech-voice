import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Copy,
  Check,
  Clock,
  Filter,
  FileText,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface HistoryItem {
  id: string;
  platform: string | null;
  content: string | null;
  analysis_score: number | null;
  created_at: string | null;
  project_title: string | null;
}

const platformColors: Record<string, string> = {
  linkedin: "bg-blue-500/10 text-blue-600 border-blue-200",
  x: "bg-gray-800/10 text-gray-800 border-gray-300",
  twitter: "bg-gray-800/10 text-gray-800 border-gray-300",
  threads: "bg-purple-500/10 text-purple-600 border-purple-200",
  instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  reddit: "bg-orange-500/10 text-orange-600 border-orange-200",
  youtube: "bg-red-500/10 text-red-600 border-red-200",
};

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all content outputs for user's projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title")
        .eq("user_id", user.id);

      if (!projects || projects.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const projectIds = projects.map((p) => p.id);
      const projectMap = new Map(projects.map((p) => [p.id, p.title]));

      const { data: contents, error } = await supabase
        .from("content_outputs")
        .select("id, platform, content, analysis_score, created_at, project_id")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const historyItems: HistoryItem[] = (contents || []).map((c) => ({
        id: c.id,
        platform: c.platform,
        content: c.content,
        analysis_score: c.analysis_score,
        created_at: c.created_at,
        project_title: c.project_id ? projectMap.get(c.project_id) || null : null,
      }));

      setHistory(historyItems);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = (item.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || item.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const uniquePlatforms = [...new Set(history.map((h) => h.platform).filter(Boolean))];

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Content Library</h1>
          <p className="text-muted-foreground mt-1">All your generated content in one place</p>
        </div>

        {/* Filters */}
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                {uniquePlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform!}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* History List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-dashed">
              <CardContent className="p-12 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6"
                >
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No content yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  When you generate content, it will appear here for easy reference and reuse.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div className="grid gap-4">
              {filteredHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                        <div className="flex items-center gap-3 flex-wrap">
                          {item.platform && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${platformColors[item.platform.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                              {item.platform}
                            </span>
                          )}
                          {item.project_title && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                              {item.project_title}
                            </span>
                          )}
                          {item.analysis_score !== null && (
                            <span className="flex items-center gap-1 text-sm">
                              <TrendingUp className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium">{item.analysis_score}</span>
                              <span className="text-muted-foreground">/100</span>
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "No date"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.id, item.content || "")}
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                          {item.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
