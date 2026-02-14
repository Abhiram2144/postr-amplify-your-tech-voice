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
  Clock,
  Filter,
  TrendingUp,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
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
  "youtube shorts": "bg-red-500/10 text-red-600 border-red-200",
  tiktok: "bg-foreground/5 text-foreground border-border",
};

const normalizePlatformKey = (value: string) => {
  const normalized = value.toLowerCase().replace(/[_-]+/g, " ").trim();

  if (normalized === "instagram reels" || normalized === "ig reels" || normalized === "reels") {
    return "instagram";
  }

  if (normalized === "youtube shorts" || normalized === "shorts") {
    return "youtube";
  }

  if (normalized === "tik tok") {
    return "tiktok";
  }

  return normalized;
};

const inputTypeLabel = (inputType: string | null | undefined) => {
  if (!inputType) return null;
  const normalized = inputType.toLowerCase().replace(/[_-]+/g, " ").trim();
  if (normalized === "brief topic") return "Brief Topic";
  if (normalized === "script") return "Script";
  if (normalized === "video upload" || normalized === "video") return "Video";
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
};

const PlatformLogo = ({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) => {
  const normalized = normalizePlatformKey(platform);

  switch (normalized) {
    case "linkedin":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.5 23.5h4V7.5h-4v16Zm7.5-16h3.8v2.2h.05c.53-1 1.84-2.2 3.78-2.2 4.04 0 4.78 2.66 4.78 6.12v9.88h-4V14.7c0-2.1-.04-4.8-2.92-4.8-2.93 0-3.38 2.29-3.38 4.65v8.95h-4v-16Z" />
        </svg>
      );
    case "x":
    case "twitter":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M18.9 2H22l-6.9 7.9L23.1 22h-6.5l-5.1-6.7L5.7 22H2.5l7.4-8.5L1.3 2h6.7l4.6 6.1L18.9 2Zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20Z" />
        </svg>
      );
    case "threads":
      return (
        <svg aria-hidden="true" viewBox="0 0 192 192" className={className} fill="currentColor">
          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.398c-15.09 0-27.632 6.497-35.302 18.27l13.186 9.045c5.706-8.667 14.468-12.876 26.116-12.876h.282c10.122.062 17.763 3.004 22.705 8.74 3.594 4.174 5.991 9.878 7.18 17.081a83.793 83.793 0 0 0-22.364-2.742c-26.118 0-42.884 13.752-43.643 35.777-.394 11.48 4.23 22.306 13.021 30.475 8.331 7.74 19.205 11.802 30.616 11.426 15.09-.497 26.89-6.258 35.063-17.12 6.21-8.253 10.083-18.815 11.596-31.683 6.937 4.193 12.08 9.743 14.805 16.545 4.612 11.518 4.882 30.46-9.478 44.82-12.613 12.613-27.771 18.087-50.744 18.26-25.476-.192-44.735-8.374-57.26-24.328-11.69-14.89-17.734-36.03-17.963-62.829.229-26.8 6.273-47.94 17.963-62.83C62.527 19.373 81.786 11.19 107.262 11c25.632.192 45.095 8.474 57.848 24.62 6.254 7.914 10.98 17.608 14.08 28.67l15.378-4.148c-3.652-13.02-9.449-24.582-17.298-34.51C161.182 5.846 137.543-3.755 107.158-4h-.208c-30.22.244-53.666 9.83-69.678 28.5C21.778 42.548 14.063 68.147 13.776 99.86v.28c.287 31.712 8.002 57.312 23.496 75.36 16.012 18.67 39.458 28.256 69.678 28.5h.208c27.263-.193 46.696-7.24 63.007-22.815 20.892-19.946 20.04-45.062 13.478-61.463-4.708-11.775-14.015-21.317-26.96-27.738-.054-.027-.11-.05-.146-.068Zm-49.146 55.755c-12.656.417-25.849-4.96-26.163-17.087-.233-9.024 6.39-19.138 28.238-19.138 2.5 0 4.9.127 7.19.364 5.108.529 9.912 1.533 14.366 2.958-1.632 22.597-12.466 32.464-23.631 32.903Z" />
        </svg>
      );
    case "reddit":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M14.9 2.6a1.6 1.6 0 0 0-1.9 1.2l-.8 3.5c-2.4.1-4.6.8-6.2 1.8a2.2 2.2 0 1 0-1.2 4c.2 3.6 3.9 6.4 8.2 6.4 4.3 0 8-2.8 8.2-6.4a2.2 2.2 0 1 0-1.5-4.1c-1.7-1-3.9-1.7-6.4-1.8l.7-3.1 2.2.5a1.5 1.5 0 1 0 .4-1.3l-2.7-.7Zm-6 12.4c-.7 0-1.2-.5-1.2-1.2 0-.6.5-1.2 1.2-1.2s1.2.5 1.2 1.2c0 .7-.5 1.2-1.2 1.2Zm6.2 0c-.7 0-1.2-.5-1.2-1.2 0-.6.5-1.2 1.2-1.2.6 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2Zm-6 1.9c1.1 1 3.7 1 4.8 0l1.2 1.2c-1.8 1.6-5.4 1.6-7.2 0l1.2-1.2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Zm10 2H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5Zm-5 3A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.25-2.35a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
        </svg>
      );
    case "youtube":
    case "youtube shorts":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.6 31.6 0 0 0 2 12c0 1.6.1 3.2.4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.3-1.6.4-3.2.4-4.8 0-1.6-.1-3.2-.4-4.8ZM10.1 15.3V8.7l6 3.3-6 3.3Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M14 2h2.2c.3 2.2 1.8 3.9 4 4.3V8.5c-1.6-.1-3.2-.7-4.2-1.7v7.6c0 3-2.4 5.6-5.6 5.6S5 17.5 5 14.4c0-3 2.4-5.6 5.6-5.6.4 0 .8 0 1.2.1v2.4c-.4-.2-.8-.3-1.2-.3-1.7 0-3.1 1.4-3.1 3.1 0 1.8 1.4 3.1 3.1 3.1 1.8 0 3.2-1.3 3.2-3.6V2Z" />
        </svg>
      );
    default:
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2.5A9.5 9.5 0 1 0 21.5 12 9.5 9.5 0 0 0 12 2.5Zm0 17A7.5 7.5 0 1 1 19.5 12 7.5 7.5 0 0 1 12 19.5Z" />
        </svg>
      );
  }
};

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
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
    const matchesPlatform =
      platformFilter === "all" ||
      (platformFilter === "video" ? gen.input_type === "video_upload" : gen.platforms.includes(platformFilter));
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

  const handleDeleteGeneration = async (generationId: string) => {
    try {
      const { error } = await supabase
        .from("content_outputs")
        .delete()
        .eq("generation_id", generationId);

      if (error) throw error;

      if (viewGenerationId === generationId) {
        setViewOpen(false);
        setViewGenerationId(null);
        setGenerationNotes([]);
      }

      await fetchHistory();
      toast({
        title: "Content deleted",
        description: "The generation has been removed",
      });
    } catch (error) {
      console.error("Error deleting generation:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
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
                <SelectItem value="video">Video</SelectItem>
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
                  {(() => {
                    const isVideo = gen.input_type === "video_upload";
                    return (
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Card
                      className={`hover:shadow-md hover:border-primary/50 transition-all cursor-pointer ${isVideo ? "border-primary/30 bg-primary/5" : ""}`}
                    >
                      <CardContent className="p-3 sm:p-4">

                        <button
                          onClick={() => {
                            setViewGenerationId(gen.generation_id);
                            setViewOpen(true);
                          }}
                          className="w-full text-left"
                        >
                          <div className="space-y-2">
                            {/* Metadata Row */}
                            <div className="flex items-start justify-between gap-3">
                              {/* Platforms and Project */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {gen.platforms.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {gen.platforms.slice(0, 3).map((p) => {
                                      const platformKey = normalizePlatformKey(p);
                                      return (
                                      <motion.div
                                        key={p}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        <div
                                          className={`flex h-8 w-8 items-center justify-center rounded-full border ${platformColors[platformKey] || "bg-muted text-muted-foreground border-border"}`}
                                        >
                                          <PlatformLogo platform={platformKey} className="h-4 w-4" />
                                          <span className="sr-only">{p}</span>
                                        </div>
                                      </motion.div>
                                      );
                                    })}
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
                                {gen.input_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {inputTypeLabel(gen.input_type) ?? "Mode"}
                                  </Badge>
                                )}
                                {isVideo && (
                                  <div className="flex items-center gap-1.5 text-xs text-primary">
                                    <Video className="h-3.5 w-3.5" />
                                    <span className="font-medium">Video</span>
                                  </div>
                                )}
                              </div>

                              {/* Score and Date */}
                              <div className="flex items-center gap-3 text-sm flex-wrap justify-end">
                                {gen.analysis_score !== null && (
                                  <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-full">
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
                                <ContentActionMenu
                                  onView={() => {
                                    setViewGenerationId(gen.generation_id);
                                    setViewOpen(true);
                                  }}
                                  onDelete={() => handleDeleteGeneration(gen.generation_id)}
                                />
                              </div>
                            </div>

                            {/* Input Preview */}
                            <div>
                              <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                                {gen.original_input || (gen.input_type === "video_upload" ? "Video upload" : "No description")}
                              </p>
                            </div>

                            {/* Character count */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                              <span>{(gen.representative.content || "").length} characters</span>
                            </div>
                          </div>
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                  );
                  })()}
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
