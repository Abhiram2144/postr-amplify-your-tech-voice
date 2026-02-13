import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import LinkContentModal from "@/components/dashboard/LinkContentModal";
import GenerationOutputsModal from "@/components/dashboard/GenerationOutputsModal";
import BeautifulContentModal from "@/components/dashboard/BeautifulContentModal";
import { ContentActionMenu } from "@/components/dashboard/ContentActionMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  StickyNote,
  Clock,
  Copy,
  Check,
  Trash2,
  Filter,
  Sparkles,
  TrendingUp,
  Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContents, useProjectNotes, type Project, type ContentOutput, type ProjectNote } from "@/hooks/useProjects";
import { groupContentOutputs } from "@/lib/content-generations";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const goalLabels: Record<string, string> = {
  educate: "Educate & Inform",
  grow_audience: "Grow Audience",
  sell_product: "Sell Product/Service",
  build_brand: "Build Personal Brand",
  share_story: "Share Stories & Experiences",
  entertain: "Entertain",
};

const platformColors: Record<string, string> = {
  linkedin: "bg-blue-500/10 text-blue-600 border-blue-200",
  x: "bg-gray-800/10 text-gray-800 border-gray-300",
  twitter: "bg-gray-800/10 text-gray-800 border-gray-300",
  threads: "bg-purple-500/10 text-purple-600 border-purple-200",
  instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  "instagram reels": "bg-pink-500/10 text-pink-600 border-pink-200",
  reddit: "bg-orange-500/10 text-orange-600 border-orange-200",
  youtube: "bg-red-500/10 text-red-600 border-red-200",
  "youtube shorts": "bg-red-500/10 text-red-600 border-red-200",
  tiktok: "bg-foreground/5 text-foreground border-border",
};

const normalizePlatformKey = (value: string) =>
  value.toLowerCase().replace(/[_-]+/g, " ").trim();

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
    case "instagram reels":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Zm10 2H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5Zm-5 3A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.25-2.35a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
        </svg>
      );
    case "youtube":
    case "youtube shorts":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [newNoteLinkedContentId, setNewNoteLinkedContentId] = useState<string | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTargetIsNew, setLinkTargetIsNew] = useState(false);
  const [linkTargetNoteId, setLinkTargetNoteId] = useState<string | null>(null);
  const [viewGenerationOpen, setViewGenerationOpen] = useState(false);
  const [viewGenerationId, setViewGenerationId] = useState<string | null>(null);

  const { contents, loading: contentsLoading, deleteGeneration } = useProjectContents(projectId || null);
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useProjectNotes(projectId || null);

  const contentById = useMemo(() => {
    return new Map(contents.map((c) => [c.id, c] as const));
  }, [contents]);

  const generations = useMemo(() => groupContentOutputs(contents), [contents]);

  const generationById = useMemo(() => {
    return new Map(generations.map((g) => [g.generation_id, g] as const));
  }, [generations]);

  const selectedGeneration = useMemo(() => {
    if (!viewGenerationId) return null;
    return generationById.get(viewGenerationId) ?? null;
  }, [generationById, viewGenerationId]);

  const selectedGenerationNotes = useMemo(() => {
    if (!selectedGeneration) return [];
    const outputIds = new Set(selectedGeneration.outputs.map((o) => o.id));
    return notes.filter((n) => n.content_output_id && outputIds.has(n.content_output_id));
  }, [notes, selectedGeneration]);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    try {
      setProjectLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setProject({
        ...data,
        platforms: data.platforms || [],
        archived: data.archived || false,
      } as Project);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
      navigate("/dashboard/projects");
    } finally {
      setProjectLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    await createNote(newNoteText.trim(), newNoteLinkedContentId);
    setNewNoteText("");
    setNewNoteLinkedContentId(null);
  };

  const handleSaveNote = async (id: string) => {
    if (!editingNoteText.trim()) return;
    await updateNote(id, { text: editingNoteText.trim() });
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const openLinkModalForNewNote = () => {
    setLinkTargetIsNew(true);
    setLinkTargetNoteId(null);
    setLinkModalOpen(true);
  };

  const openLinkModalForExistingNote = (noteId: string) => {
    setLinkTargetIsNew(false);
    setLinkTargetNoteId(noteId);
    setLinkModalOpen(true);
  };

  const handleConvertNoteToContent = (note: ProjectNote) => {
    // Navigate to generate page with note text pre-filled
    navigate(`/dashboard/generate?text=${encodeURIComponent(note.text)}&projectId=${projectId}`);
  };

  // Filter and sort generations
  const filteredGenerations = generations
    .filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (g.original_input || "").toLowerCase().includes(q) ||
        g.outputs.some((o) => (o.content || "").toLowerCase().includes(q));
      const matchesPlatform = platformFilter === "all" || g.platforms.includes(platformFilter);
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.analysis_score || 0) - (a.analysis_score || 0);
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  // Get unique platforms from contents
  const uniquePlatforms = [...new Set(contents.map((c) => c.platform).filter(Boolean))];

  if (projectLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2"
            onClick={() => navigate("/dashboard/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {project?.title || "Untitled Project"}
              </h1>
              {project?.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {project?.goal && (
                  <Badge variant="secondary">
                    {goalLabels[project.goal] || project.goal}
                  </Badge>
                )}
                {project?.archived && (
                  <Badge variant="outline">Archived</Badge>
                )}
              </div>
            </div>

            <Button
              variant="hero"
              className="gap-2 shrink-0"
              onClick={() => navigate(`/dashboard/generate?projectId=${projectId}`)}
            >
              <Plus className="h-4 w-4" />
              Create Content
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contents" className="w-full">
          <TabsList>
            <TabsTrigger value="contents" className="gap-2">
              <FileText className="h-4 w-4" />
              Contents ({generations.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          {/* Contents Tab */}
          <TabsContent value="contents" className="mt-4 space-y-4">
            {/* Filters */}
            {contents.length > 0 && (
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
                    <SelectValue placeholder="Platform" />
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
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "score")}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Newest first</SelectItem>
                    <SelectItem value="score">Highest score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contents List */}
            {contentsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGenerations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No content yet
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Generate content to start building your project library.
                  </p>
                  <Button
                    variant="hero"
                    className="gap-2"
                    onClick={() => navigate(`/dashboard/generate?projectId=${projectId}`)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filteredGenerations.map((gen, index) => (
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
                          setViewGenerationOpen(true);
                        }}
                        className="w-full text-left"
                      >
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                            <CardContent className="p-3 sm:p-4">
                              <div className="space-y-2">
                                {/* Metadata Row */}
                                <div className="flex items-start justify-between gap-3">
                                  {/* Platforms */}
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
                                  </div>

                                  {/* Score, Date, Actions */}
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
                                        setViewGenerationOpen(true);
                                      }}
                                      onCopy={() => {
                                        handleCopy(gen.generation_id, gen.representative.content || "");
                                      }}
                                      onDelete={() => deleteGeneration(gen.generation_id)}
                                      isCopied={copiedId === gen.generation_id}
                                    />
                                  </div>
                                </div>

                                {/* Input Preview */}
                                <div>
                                  <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                                    {gen.original_input || "No description"}
                                  </p>
                                </div>

                                {/* Character count and linked notes indicator */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                  <span>{(gen.representative.content || "").length} characters</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </button>

                      {/* Action Menu moved inside card */}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4 space-y-4">
            {/* Add Note Input */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3 flex-col sm:flex-row">
                  <Input
                    placeholder="Jot down an idea for future content..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  />
                  <Button
                    variant="outline"
                    onClick={openLinkModalForNewNote}
                    disabled={contents.length === 0}
                    className="gap-2"
                  >
                    <Link2 className="h-4 w-4" />
                    {newNoteLinkedContentId ? "Linked" : "Link content"}
                  </Button>
                  <Button onClick={handleAddNote} disabled={!newNoteText.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {newNoteLinkedContentId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {(() => {
                      const linked = contentById.get(newNoteLinkedContentId);
                      const gen = linked?.generation_id ? generationById.get(linked.generation_id) : null;
                      const platforms = gen?.platforms?.length ? gen.platforms.join(", ") : linked?.platform || "content";
                      const date = gen?.created_at || linked?.created_at;
                      return (
                        <>
                          Linked to: {platforms} • {date ? format(new Date(date), "MMM d, yyyy") : ""}
                        </>
                      );
                    })()}
                  </p>
                )}
                {contents.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    No generated content yet. Generate content first to link notes.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notes List */}
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <StickyNote className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No notes yet
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Notes are quick ideas you can turn into content later. They don't consume credits.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          {editingNoteId === note.id ? (
                            <div className="flex gap-3">
                              <Input
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveNote(note.id)}
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleSaveNote(note.id)}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-foreground">{note.text}</p>
                                {note.content_output_id && contentById.get(note.content_output_id) && (
                                  <div className="mt-2">
                                    <Badge variant="secondary" className="gap-1">
                                      <Link2 className="h-3.5 w-3.5" />
                                      {(() => {
                                        const linked = contentById.get(note.content_output_id!);
                                        const gen = linked?.generation_id ? generationById.get(linked.generation_id) : null;
                                        const platforms = gen?.platforms?.length ? gen.platforms.join(", ") : linked?.platform || "content";
                                        return <>Linked: {platforms}</>;
                                      })()}
                                    </Badge>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {note.created_at ? format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a") : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openLinkModalForExistingNote(note.id)}
                                >
                                  <Link2 className="h-4 w-4 mr-1" />
                                  Link
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleConvertNoteToContent(note)}
                                  className="text-primary"
                                >
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  Generate
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteText(note.text);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteNote(note.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <LinkContentModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        contents={contents}
        selectedId={
          linkTargetIsNew
            ? newNoteLinkedContentId
            : (linkTargetNoteId ? notes.find((n) => n.id === linkTargetNoteId)?.content_output_id ?? null : null)
        }
        onSelect={async (contentId) => {
          if (linkTargetIsNew) {
            setNewNoteLinkedContentId(contentId);
            return;
          }

          if (!linkTargetNoteId) return;
          await updateNote(linkTargetNoteId, { content_output_id: contentId });
        }}
        onClear={
          linkTargetIsNew
            ? () => setNewNoteLinkedContentId(null)
            : linkTargetNoteId
              ? async () => {
                await updateNote(linkTargetNoteId, { content_output_id: null });
              }
              : undefined
        }
      />

      <BeautifulContentModal
        open={viewGenerationOpen}
        onOpenChange={setViewGenerationOpen}
        generation={selectedGeneration}
        notes={selectedGenerationNotes}
      />
    </div>
  );
};

export default ProjectDetailPage;
