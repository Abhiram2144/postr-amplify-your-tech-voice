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
  reddit: "bg-orange-500/10 text-orange-600 border-orange-200",
  youtube: "bg-red-500/10 text-red-600 border-red-200",
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
                          <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Metadata Row */}
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                  {/* Platforms */}
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

                                {/* Character count and linked notes indicator */}
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
                            setViewGenerationOpen(true);
                          }}
                          onCopy={() => {
                            handleCopy(gen.generation_id, gen.representative.content || "");
                          }}
                          onDelete={() => deleteGeneration(gen.generation_id)}
                          isCopied={copiedId === gen.generation_id}
                        />
                      </div>
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
