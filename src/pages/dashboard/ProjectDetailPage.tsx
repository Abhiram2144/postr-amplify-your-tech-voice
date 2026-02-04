import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContents, useProjectNotes, type Project, type ContentOutput, type ProjectNote } from "@/hooks/useProjects";
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

  const { contents, loading: contentsLoading, deleteContent } = useProjectContents(projectId || null);
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useProjectNotes(projectId || null);

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
    await createNote(newNoteText.trim());
    setNewNoteText("");
  };

  const handleSaveNote = async (id: string) => {
    if (!editingNoteText.trim()) return;
    await updateNote(id, editingNoteText.trim());
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handleConvertNoteToContent = (note: ProjectNote) => {
    // Navigate to generate page with note text pre-filled
    navigate(`/dashboard/generate?text=${encodeURIComponent(note.text)}&projectId=${projectId}`);
  };

  // Filter and sort contents
  const filteredContents = contents
    .filter((c) => {
      const matchesSearch = 
        (c.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.original_input || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;
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
              Contents ({contents.length})
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
            ) : filteredContents.length === 0 ? (
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
                  {filteredContents.map((content) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card>
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                            <div className="flex items-center gap-3 flex-wrap">
                              {content.platform && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${platformColors[content.platform.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                                  {content.platform}
                                </span>
                              )}
                              {content.analysis_score !== null && (
                                <span className="flex items-center gap-1 text-sm">
                                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                  <span className="font-medium">{content.analysis_score}</span>
                                  <span className="text-muted-foreground">/100</span>
                                </span>
                              )}
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {content.created_at ? format(new Date(content.created_at), "MMM d, yyyy") : "No date"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(content.id, content.content || "")}
                              >
                                {copiedId === content.id ? (
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteContent(content.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {content.content}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
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
                <div className="flex gap-3">
                  <Input
                    placeholder="Jot down an idea for future content..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  />
                  <Button onClick={handleAddNote} disabled={!newNoteText.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
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
                                <p className="text-xs text-muted-foreground mt-2">
                                  {note.created_at ? format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a") : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
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
    </div>
  );
};

export default ProjectDetailPage;
