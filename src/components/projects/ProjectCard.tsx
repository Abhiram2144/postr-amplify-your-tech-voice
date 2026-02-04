import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  StickyNote,
  Clock,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  ArrowRight,
} from "lucide-react";
import type { Project } from "@/hooks/useProjects";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const ProjectCard = ({
  project,
  onClick,
  onEdit,
  onArchive,
  onDelete,
}: ProjectCardProps) => {
  const formattedDate = project.updated_at
    ? format(new Date(project.updated_at), "MMM d, yyyy")
    : "No date";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card
        className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {project.title || "Untitled Project"}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                      {project.archived ? (
                        <>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Restore
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {project.content_count || 0} contents
                </span>
                <span className="flex items-center gap-1.5">
                  <StickyNote className="h-3.5 w-3.5" />
                  {project.notes_count || 0} notes
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
              </div>
              
              {project.goal && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent-foreground">
                    {project.goal}
                  </span>
                </div>
              )}
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 self-center" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
