import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Loader2 } from "lucide-react";

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
  { value: "educate", label: "Educate & Inform" },
  { value: "grow_audience", label: "Grow Audience" },
  { value: "sell_product", label: "Sell Product/Service" },
  { value: "build_brand", label: "Build Personal Brand" },
  { value: "share_story", label: "Share Stories & Experiences" },
  { value: "entertain", label: "Entertain" },
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Organize your content around a theme, topic, or goal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Project Name *</Label>
            <Input
              id="title"
              placeholder="e.g., SaaS Marketing Series"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue placeholder="What's the purpose of this project?" />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
