import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ContentActionMenu } from "@/components/dashboard/ContentActionMenu";
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
import type { ContentOutput, ProjectNote } from "@/hooks/useProjects";
import { groupContentOutputs, type ContentGeneration } from "@/lib/content-generations";
import BeautifulContentModal from "@/components/dashboard/BeautifulContentModal";

type HistoryGeneration = ContentGeneration & { project_title: string | null };

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
  const [history, setHistory] = useState<HistoryGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewGenerationId, setViewGenerationId] = useState<string | null>(null);
  const [generationNotes, setGenerationNotes] = useState<ProjectNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

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
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped: ContentOutput[] = (contents || []).map((c) => ({
        ...c,
        generation_id: c.generation_id || c.id,
        rewrite_count: c.rewrite_count || 0,
        analysis_feedback: c.analysis_feedback as Record<string, unknown> | null,
      }));

      const generations = groupContentOutputs(mapped);
      const historyItems: HistoryGeneration[] = generations.map((g) => ({
        ...g,
        project_title: g.project_id ? projectMap.get(g.project_id) || null : null,
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

  const filteredHistory = history.filter((gen) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (gen.original_input || "").toLowerCase().includes(q) ||
      gen.outputs.some((o) => (o.content || "").toLowerCase().includes(q));
    const matchesPlatform = platformFilter === "all" || gen.platforms.includes(platformFilter);
    return matchesSearch && matchesPlatform;
  });

  const uniquePlatforms = [...new Set(history.flatMap((h) => h.platforms).filter(Boolean))];
  const activeGeneration = viewGenerationId ? history.find((h) => h.generation_id === viewGenerationId) ?? null : null;

  useEffect(() => {
    const loadNotes = async () => {
      if (!viewOpen || !activeGeneration) {
        setGenerationNotes([]);
        return;
      }

      const outputIds = activeGeneration.outputs.map((o) => o.id).filter(Boolean);
      if (outputIds.length === 0) {
        setGenerationNotes([]);
        return;
      }

      try {
        setNotesLoading(true);
        const { data, error } = await supabase
          .from("project_notes")
          .select("id, project_id, text, content_output_id, created_at, updated_at")
          .in("content_output_id", outputIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGenerationNotes((data || []) as ProjectNote[]);
      } catch (e) {
        console.error("Error loading notes for generation:", e);
        setGenerationNotes([]);
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
  }, [activeGeneration, viewOpen]);

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
            <motion.div className="space-y-3">
              {filteredHistory.map((gen, index) => (
                <motion.div
                  key={gen.generation_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <button
                    onClick={() => {
                      setViewGenerationId(gen.generation_id);
                      setViewOpen(true);
                    }}
                    className="w-full text-left"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Metadata Row */}
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              {/* Platforms and Project */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {gen.platforms.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {gen.platforms.slice(0, 3).map((p) => (
                                      <motion.div
                                        key={p}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        <Badge
                                          className={`capitalize text-xs font-semibold ${platformColors[p] || "bg-muted text-muted-foreground"}`}
                                          variant="outline"
                                        >
                                          {p}
                                        </Badge>
                                      </motion.div>
                                    ))}
                                    {gen.platforms.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{gen.platforms.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                {gen.project_title && (
                                  <Badge variant="secondary" className="text-xs">
                                    📁 {gen.project_title}
                                  </Badge>
                                )}
                              </div>

                              {/* Score and Date */}
                              <div className="flex items-center gap-4 text-sm flex-wrap justify-end">
                                {gen.analysis_score !== null && (
                                  <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
                                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-semibold text-primary">{gen.analysis_score}</span>
                                    <span className="text-xs text-muted-foreground">/100</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-xs">
                                    {gen.created_at ? format(new Date(gen.created_at), "MMM d, yy") : "No date"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Input Preview */}
                            <div className="pt-1">
                              <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                                {gen.original_input || "No description"}
                              </p>
                            </div>

                            {/* Character count */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                              <span>{(gen.representative.content || "").length} characters</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </button>

                    {/* Action Menu */}
                    <div className="flex justify-end">
                      <ContentActionMenu
                        onView={() => {
                          setViewGenerationId(gen.generation_id);
                          setViewOpen(true);
                        }}
                        onCopy={() => {
                          handleCopy(gen.generation_id, gen.representative.content || "");
                        }}
                        isCopied={copiedId === gen.generation_id}
                      />
                    </div>
                  </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <BeautifulContentModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        generation={activeGeneration}
        notes={notesLoading ? [] : generationNotes}
      />
    </div>
  );
};

export default HistoryPage;
