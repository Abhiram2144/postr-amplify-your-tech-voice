import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, X, FileText, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ContentGeneration } from "@/lib/content-generations";
import type { ProjectNote } from "@/hooks/useProjects";

// Platform icons and config
const platformConfig: Record<string, { icon: string; color: string; bg: string }> = {
  linkedin: { icon: "💼", color: "text-blue-600", bg: "bg-blue-50" },
  x: { icon: "𝕏", color: "text-foreground", bg: "bg-gray-50" },
  twitter: { icon: "𝕏", color: "text-foreground", bg: "bg-gray-50" },
  threads: { icon: "🧵", color: "text-foreground", bg: "bg-gray-50" },
  reddit: { icon: "🤖", color: "text-orange-600", bg: "bg-orange-50" },
  instagram: { icon: "📸", color: "text-pink-600", bg: "bg-pink-50" },
  youtube: { icon: "🎬", color: "text-red-600", bg: "bg-red-50" },
  "youtube shorts": { icon: "📱", color: "text-red-600", bg: "bg-red-50" },
};

const platformLabel = (p: string) => {
  const v = p.toLowerCase();
  if (v === "twitter") return "Twitter/X";
  if (v === "x") return "Twitter/X";
  if (v === "linkedin") return "LinkedIn";
  if (v === "instagram") return "Instagram";
  if (v === "threads") return "Threads";
  if (v === "reddit") return "Reddit";
  if (v === "youtube") return "YouTube";
  return p;
};

interface GenerationOutputsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generation: ContentGeneration | null;
  title?: string;
  notes?: ProjectNote[];
}

const GenerationOutputsModal = ({ open, onOpenChange, generation, title, notes }: GenerationOutputsModalProps) => {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const defaultTab = useMemo(() => {
    const first = generation?.outputs[0]?.platform;
    return (first || "").toLowerCase() || "output";
  }, [generation?.outputs]);

  if (!generation) return null;

  const handleCopy = async (platform: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] flex flex-col">
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
              <div className="relative border-b bg-gradient-to-r from-muted/30 to-transparent p-6">
                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>

                <div className="pr-10">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg font-bold text-foreground"
                  >
                    {title || "Generated Content"}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-sm text-muted-foreground mt-1"
                  >
                    {generation.created_at ? format(new Date(generation.created_at), "MMMM d, yyyy 'at' h:mm a") : ""}
                    {generation.platforms.length > 0 && (
                      <> • {generation.platforms.length} platform{generation.platforms.length === 1 ? "" : "s"}</>
                    )}
                  </motion.p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Original input */}
                {generation.original_input && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        Original Input
                      </Badge>
                      {generation.input_type && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {generation.input_type}
                        </Badge>
                      )}
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                      {generation.original_input}
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                {notes && notes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                        Notes ({notes.length})
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {notes.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.03 }}
                          className="rounded-xl border-l-4 border-l-amber-400 bg-amber-50/50 p-3 text-sm"
                        >
                          <p className="text-xs text-amber-600 font-medium mb-1">
                            {n.created_at ? format(new Date(n.created_at), "MMM d, yyyy") : ""}
                          </p>
                          <p className="text-foreground whitespace-pre-wrap">{n.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Platform tabs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl">
                      {generation.outputs.map((o) => {
                        const platform = (o.platform || "output").toLowerCase();
                        const config = platformConfig[platform] || { icon: "📝", bg: "bg-muted" };
                        return (
                          <TabsTrigger
                            key={o.id}
                            value={platform}
                            className="flex-1 min-w-[90px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg gap-1.5 transition-all"
                          >
                            <span>{config.icon}</span>
                            <span className="hidden sm:inline">{platformLabel(o.platform || "Output")}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {generation.outputs.map((o, index) => {
                      const platform = (o.platform || "output").toLowerCase();
                      return (
                        <TabsContent key={o.id} value={platform} className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="rounded-xl border bg-background p-5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                              {o.content}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {(o.content || "").length} characters
                              </span>
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                  variant={copiedPlatform === (o.platform || "") ? "default" : "outline"}
                                  size="sm"
                                  className="gap-2 rounded-lg"
                                  onClick={() => handleCopy(o.platform || "", o.content || "")}
                                >
                                  {copiedPlatform === (o.platform || "") ? (
                                    <>
                                      <Check className="h-3.5 w-3.5" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationOutputsModal;
