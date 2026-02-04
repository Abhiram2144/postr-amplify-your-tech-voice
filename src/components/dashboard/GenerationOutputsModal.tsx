import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ContentGeneration } from "@/lib/content-generations";
import type { ProjectNote } from "@/hooks/useProjects";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title || "Generated content"}</DialogTitle>
          <DialogDescription>
            {generation.created_at ? `Created ${format(new Date(generation.created_at), "MMM d, yyyy")}` : ""}
            {generation.platforms.length > 0 ? ` • ${generation.platforms.length} platform${generation.platforms.length === 1 ? "" : "s"}` : ""}
          </DialogDescription>
        </DialogHeader>

        {generation.original_input && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">Original input</Badge>
              {generation.input_type && <Badge variant="outline">{generation.input_type}</Badge>}
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{generation.original_input}</div>
          </div>
        )}

        {notes && notes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">Notes</Badge>
              <Badge variant="outline">{notes.length}</Badge>
            </div>
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                  <div className="text-xs text-muted-foreground mb-1">
                    {n.created_at ? format(new Date(n.created_at), "MMM d, yyyy") : ""}
                  </div>
                  {n.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {generation.outputs.map((o) => (
              <TabsTrigger
                key={o.id}
                value={(o.platform || "output").toLowerCase()}
                className="flex-1 min-w-[90px] data-[state=active]:bg-background"
              >
                {platformLabel(o.platform || "Output")}
              </TabsTrigger>
            ))}
          </TabsList>

          {generation.outputs.map((o) => (
            <TabsContent key={o.id} value={(o.platform || "output").toLowerCase()} className="mt-4">
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {o.content}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{(o.content || "").length} characters</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(o.content || "");
                      setCopiedPlatform(o.platform || "");
                      setTimeout(() => setCopiedPlatform(null), 1200);
                    }}
                  >
                    {copiedPlatform === (o.platform || "") ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationOutputsModal;
