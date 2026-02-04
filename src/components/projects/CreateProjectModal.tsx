import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FolderPlus, X, Sparkles } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    title: string;
    description?: string;
    goal?: string;
    platforms?: string[];
  }) => Promise<unknown>;
}

const goalOptions = [
  { value: "educate", label: "Educate & Inform", emoji: "📚" },
  { value: "grow_audience", label: "Grow Audience", emoji: "📈" },
  { value: "sell_product", label: "Sell Product/Service", emoji: "💼" },
  { value: "build_brand", label: "Build Personal Brand", emoji: "⭐" },
  { value: "share_story", label: "Share Stories & Experiences", emoji: "📖" },
  { value: "entertain", label: "Entertain", emoji: "🎭" },
];

const CreateProjectModal = ({
  open,
  onOpenChange,
  onCreate,
}: CreateProjectModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        goal: goal || undefined,
      });
      setTitle("");
      setDescription("");
      setGoal("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>

              <div className="relative p-6">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <FolderPlus className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Create New Project</h2>
                    <p className="text-sm text-muted-foreground">
                      Organize your content around a theme or goal
                    </p>
                  </div>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="title" className="text-sm font-medium">
                      Project Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., SaaS Marketing Series"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                      className="border-muted-foreground/20 focus-visible:ring-primary/30"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="What is this project about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="border-muted-foreground/20 focus-visible:ring-primary/30 resize-none"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="goal" className="text-sm font-medium">
                      Goal
                    </Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="border-muted-foreground/20 focus:ring-primary/30">
                        <SelectValue placeholder="What's the purpose?" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span>{option.emoji}</span>
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end gap-3 pt-4"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        variant="hero"
                        disabled={!title.trim() || loading}
                        className="gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Create Project
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
