import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string | null;
  description: string | null;
  goal: string | null;
  platforms: string[];
  input_type: string | null;
  status: string | null;
  archived: boolean;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  content_count?: number;
  notes_count?: number;
}

export interface ContentOutput {
  id: string;
  project_id: string | null;
  content: string | null;
  content_type: string | null;
  platform: string | null;
  original_input: string | null;
  input_type: string | null;
  analysis_score: number | null;
  analysis_feedback: Record<string, unknown> | null;
  improved_content: string | null;
  rewrite_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  text: string;
  created_at: string | null;
  updated_at: string | null;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch projects with content counts
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Get content counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count: contentCount } = await supabase
            .from("content_outputs")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          const { count: notesCount } = await supabase
            .from("project_notes")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          return {
            ...project,
            platforms: project.platforms || [],
            archived: project.archived || false,
            content_count: contentCount || 0,
            notes_count: notesCount || 0,
          } as Project;
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: {
    title: string;
    description?: string;
    goal?: string;
    platforms?: string[];
  }) => {
    if (!user) return null;

    try {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          goal: data.goal || null,
          platforms: data.platforms || [],
          status: "active",
          archived: false,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      toast({
        title: "Project created",
        description: `"${data.title}" has been created`,
      });
      return project;
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProject = async (
    id: string,
    data: Partial<Pick<Project, "title" | "description" | "goal" | "platforms" | "archived">>
  ) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      await fetchProjects();
      toast({
        title: "Project updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchProjects();
      toast({
        title: "Project deleted",
        description: "The project has been permanently removed",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const archiveProject = async (id: string, archived: boolean) => {
    await updateProject(id, { archived });
  };

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);

  return {
    projects,
    activeProjects,
    archivedProjects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
  };
};

export const useProjectContents = (projectId: string | null) => {
  const [contents, setContents] = useState<ContentOutput[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = useCallback(async () => {
    if (!projectId) {
      setContents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_outputs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContents((data || []).map(item => ({
        ...item,
        rewrite_count: item.rewrite_count || 0,
        analysis_feedback: item.analysis_feedback as Record<string, unknown> | null,
      })));
    } catch (error) {
      console.error("Error fetching contents:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("content_outputs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchContents();
      toast({
        title: "Content deleted",
        description: "The content has been removed",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  return { contents, loading, fetchContents, deleteContent };
};

export const useProjectNotes = (projectId: string | null) => {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!projectId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_notes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (text: string) => {
    if (!projectId) return null;

    try {
      const { data, error } = await supabase
        .from("project_notes")
        .insert({ project_id: projectId, text })
        .select()
        .single();

      if (error) throw error;
      await fetchNotes();
      toast({
        title: "Note added",
        description: "Your idea has been saved",
      });
      return data;
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateNote = async (id: string, text: string) => {
    try {
      const { error } = await supabase
        .from("project_notes")
        .update({ text })
        .eq("id", id);

      if (error) throw error;
      await fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("project_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchNotes();
      toast({
        title: "Note deleted",
        description: "The note has been removed",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return { notes, loading, fetchNotes, createNote, updateNote, deleteNote };
};
