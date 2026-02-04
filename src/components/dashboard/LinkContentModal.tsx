import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Search, Link2, Unlink } from "lucide-react";
import type { ContentOutput } from "@/hooks/useProjects";
import { findGenerationIdForOutputId, groupContentOutputs } from "@/lib/content-generations";

interface LinkContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contents: ContentOutput[];
  selectedId?: string | null;
  onSelect: (contentId: string) => void;
  onClear?: () => void;
}

const platformClass: Record<string, string> = {
  linkedin: "bg-blue-500/10 text-blue-600 border-blue-200",
  twitter: "bg-gray-800/10 text-gray-800 border-gray-300",
  x: "bg-gray-800/10 text-gray-800 border-gray-300",
  threads: "bg-purple-500/10 text-purple-600 border-purple-200",
  instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  reddit: "bg-orange-500/10 text-orange-600 border-orange-200",
  youtube: "bg-red-500/10 text-red-600 border-red-200",
};

const LinkContentModal = ({
  open,
  onOpenChange,
  contents,
  selectedId,
  onSelect,
  onClear,
}: LinkContentModalProps) => {
  const [query, setQuery] = useState("");

  const generations = useMemo(() => groupContentOutputs(contents), [contents]);
  const selectedGenerationId = useMemo(() => findGenerationIdForOutputId(contents, selectedId), [contents, selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return generations;

    return generations.filter((g) => {
      const haystack = `${g.platforms.join(",")}\n${g.outputs.map((o) => o.content ?? "").join("\n")}\n${g.original_input ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [generations, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Link note to content
          </DialogTitle>
          <DialogDescription>
            Pick content you generated for this project. Use search to quickly find it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by platform, content, or original input..."
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[380px] rounded-md border">
            <div className="p-2 space-y-2">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No matching content found.</div>
              ) : (
                filtered.map((g) => {
                  const isSelected = selectedGenerationId === g.generation_id;
                  const snippet = (g.representative.content || "").replace(/\s+/g, " ").trim().slice(0, 160);

                  return (
                    <div
                      key={g.generation_id}
                      className={`rounded-lg border p-3 flex items-start gap-3 ${isSelected ? "border-primary bg-primary/5" : "bg-background"}`}
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {g.platforms.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {g.platforms.map((p) => {
                                const cls = platformClass[p] || "bg-muted text-muted-foreground";
                                return (
                                  <span
                                    key={p}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${cls}`}
                                  >
                                    {p}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {g.created_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(g.created_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                          {snippet}{snippet.length >= 160 ? "…" : ""}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          onSelect(g.representative.id);
                          onOpenChange(false);
                        }}
                      >
                        {isSelected ? "Linked" : "Link"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {onClear && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  onClear();
                  onOpenChange(false);
                }}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Remove link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkContentModal;
