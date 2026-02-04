import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Search, Link2, Unlink, X, Check } from "lucide-react";
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

const platformConfig: Record<string, { icon: string; color: string; bg: string }> = {
  linkedin: { icon: "💼", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  twitter: { icon: "𝕏", color: "text-foreground", bg: "bg-gray-50 border-gray-200" },
  x: { icon: "𝕏", color: "text-foreground", bg: "bg-gray-50 border-gray-200" },
  threads: { icon: "🧵", color: "text-foreground", bg: "bg-gray-50 border-gray-200" },
  instagram: { icon: "📸", color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  reddit: { icon: "🤖", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  youtube: { icon: "🎬", color: "text-red-600", bg: "bg-red-50 border-red-200" },
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
  const selectedGenerationId = useMemo(
    () => findGenerationIdForOutputId(contents, selectedId),
    [contents, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return generations;

    return generations.filter((g) => {
      const haystack = `${g.platforms.join(",")}\n${g.outputs
        .map((o) => o.content ?? "")
        .join("\n")}\n${g.original_input ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [generations, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl max-h-[85vh] flex flex-col">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative flex flex-col h-full"
            >
              {/* Header */}
              <div className="relative border-b bg-gradient-to-r from-primary/5 to-transparent p-6">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>

                <div className="flex items-center gap-3 pr-10">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Link2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Link to Content</h2>
                    <p className="text-sm text-muted-foreground">
                      Connect this note to generated content
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b bg-muted/20">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by platform, content, or input..."
                    className="pl-10 bg-background border-muted-foreground/20 focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              {/* Content list */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {filtered.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No matching content found.</p>
                    </motion.div>
                  ) : (
                    filtered.map((g, index) => {
                      const isSelected = selectedGenerationId === g.generation_id;
                      const snippet = (g.representative.content || "")
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 140);

                      return (
                        <motion.div
                          key={g.generation_id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ scale: 1.01, x: 2 }}
                          className={`rounded-xl border p-4 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background hover:border-muted-foreground/30 hover:bg-muted/30"
                          }`}
                          onClick={() => {
                            onSelect(g.representative.id);
                            onOpenChange(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Platforms & date */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {g.platforms.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {g.platforms.slice(0, 3).map((p) => {
                                      const config = platformConfig[p] || {
                                        icon: "📝",
                                        bg: "bg-muted border-muted",
                                      };
                                      return (
                                        <span
                                          key={p}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
                                        >
                                          {config.icon}
                                          <span className="capitalize">{p}</span>
                                        </span>
                                      );
                                    })}
                                    {g.platforms.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{g.platforms.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {g.created_at && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(g.created_at), "MMM d, yyyy")}
                                  </span>
                                )}
                              </div>

                              {/* Snippet */}
                              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                                {snippet}
                                {snippet.length >= 140 ? "…" : ""}
                              </p>
                            </div>

                            {/* Link indicator */}
                            <div
                              className={`shrink-0 p-2 rounded-lg transition-colors ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              {onClear && (
                <div className="border-t p-4 bg-muted/20">
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground gap-2"
                    onClick={() => {
                      onClear();
                      onOpenChange(false);
                    }}
                  >
                    <Unlink className="h-4 w-4" />
                    Remove Link
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default LinkContentModal;
