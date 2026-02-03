import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  Video,
  Clock,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  inputType: "text" | "video";
  status: "draft" | "completed";
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Placeholder projects - empty for now to show empty state
  const projects: Project[] = [];

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Project["status"]) => {
    if (status === "completed") return "bg-green-500/10 text-green-600";
    return "bg-yellow-500/10 text-yellow-600";
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
            <p className="text-muted-foreground mt-1">Your saved ideas and ongoing work</p>
          </div>
          <Button
            variant="hero"
            className="gap-2 shrink-0"
            onClick={() => navigate("/dashboard/generate")}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        {projects.length > 0 && (
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

        {/* Projects List */}
        {projects.length === 0 ? (
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
                  <FolderOpen className="h-10 w-10 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Start creating content and your projects will appear here for easy access.
                </p>
                <Button
                  variant="hero"
                  className="gap-2"
                  onClick={() => navigate("/dashboard/generate")}
                >
                  <Plus className="h-4 w-4" />
                  Create your first project
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-3"
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card
                  className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                  onClick={() => navigate(`/dashboard/generate?project=${project.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
                      {project.inputType === "video" ? (
                        <Video className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      ) : (
                        <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{project.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="capitalize">{project.inputType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.createdAt}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectsPage;
