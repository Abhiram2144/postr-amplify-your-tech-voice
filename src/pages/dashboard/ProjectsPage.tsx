import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  FolderOpen,
  Archive,
} from "lucide-react";
import { useProjects, type Project } from "@/hooks/useProjects";
import ProjectCard from "@/components/projects/ProjectCard";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import EditProjectModal from "@/components/projects/EditProjectModal";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const {
    activeProjects,
    archivedProjects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filterProjects = (projects: Project[]) =>
    projects.filter((p) =>
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredActive = filterProjects(activeProjects);
  const filteredArchived = filterProjects(archivedProjects);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject.id);
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const renderProjectList = (projects: Project[], emptyMessage: string, emptyIcon: React.ReactNode) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6"
            >
              {emptyIcon}
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {emptyMessage}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Projects help you organize content around themes, topics, or goals.
            </p>
            <Button
              variant="hero"
              className="gap-2"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create your first project
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              onEdit={() => handleEdit(project)}
              onArchive={() => archiveProject(project.id, !project.archived)}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Organize your content like playlists
            </p>
          </div>
          <Button
            variant="hero"
            className="gap-2 shrink-0"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        {(activeProjects.length > 0 || archivedProjects.length > 0) && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Tabs for Active/Archived */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2">
              <Archive className="h-4 w-4" />
              Archived ({archivedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {renderProjectList(
              filteredActive,
              "No active projects",
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            {renderProjectList(
              filteredArchived,
              "No archived projects",
              <Archive className="h-10 w-10 text-muted-foreground" />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modals */}
      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={createProject}
      />
      <EditProjectModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        project={selectedProject}
        onSave={updateProject}
      />
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={selectedProject}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ProjectsPage;
