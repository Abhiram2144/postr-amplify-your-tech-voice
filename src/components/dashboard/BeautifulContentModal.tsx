import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, X, RefreshCw, FileText, MessageSquare } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentGeneration } from "@/lib/content-generations";
import type { ProjectNote } from "@/hooks/useProjects";

// Platform icons as SVG components
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const ThreadsIcon = () => (
  <svg viewBox="0 0 192 192" className="h-5 w-5" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.398c-15.09 0-27.632 6.497-35.302 18.27l13.186 9.045c5.706-8.667 14.468-12.876 26.116-12.876h.282c10.122.062 17.763 3.004 22.705 8.74 3.594 4.174 5.991 9.878 7.18 17.081a83.793 83.793 0 0 0-22.364-2.742c-26.118 0-42.884 13.752-43.643 35.777-.394 11.48 4.23 22.306 13.021 30.475 8.331 7.74 19.205 11.802 30.616 11.426 15.09-.497 26.89-6.258 35.063-17.12 6.21-8.253 10.083-18.815 11.596-31.683 6.937 4.193 12.08 9.743 14.805 16.545 4.612 11.518 4.882 30.46-9.478 44.82-12.613 12.613-27.771 18.087-50.744 18.26-25.476-.192-44.735-8.374-57.26-24.328-11.69-14.89-17.734-36.03-17.963-62.829.229-26.8 6.273-47.94 17.963-62.83C62.527 19.373 81.786 11.19 107.262 11c25.632.192 45.095 8.474 57.848 24.62 6.254 7.914 10.98 17.608 14.08 28.67l15.378-4.148c-3.652-13.02-9.449-24.582-17.298-34.51C161.182 5.846 137.543-3.755 107.158-4h-.208c-30.22.244-53.666 9.83-69.678 28.5C21.778 42.548 14.063 68.147 13.776 99.86v.28c.287 31.712 8.002 57.312 23.496 75.36 16.012 18.67 39.458 28.256 69.678 28.5h.208c27.263-.193 46.696-7.24 63.007-22.815 20.892-19.946 20.04-45.062 13.478-61.463-4.708-11.775-14.015-21.317-26.96-27.738-.054-.027-.11-.05-.146-.068Zm-49.146 55.755c-12.656.417-25.849-4.96-26.163-17.087-.233-9.024 6.39-19.138 28.238-19.138 2.5 0 4.9.127 7.19.364 5.108.529 9.912 1.533 14.366 2.958-1.632 22.597-12.466 32.464-23.631 32.903Z" />
  </svg>
);
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const platformConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  linkedin: { icon: <LinkedInIcon />, color: "text-[#0A66C2]", bg: "bg-blue-50 border-blue-200" },
  x: { icon: <XIcon />, color: "text-foreground", bg: "bg-gray-50 border-gray-200" },
  twitter: { icon: <XIcon />, color: "text-foreground", bg: "bg-gray-50 border-gray-200" },
  threads: { icon: <ThreadsIcon />, color: "text-foreground", bg: "bg-gray-50 border-gray-200" },
  reddit: { icon: <RedditIcon />, color: "text-[#FF4500]", bg: "bg-orange-50 border-orange-200" },
  instagram: { icon: <InstagramIcon />, color: "text-[#E4405F]", bg: "bg-pink-50 border-pink-200" },
  youtube: { icon: <YouTubeIcon />, color: "text-[#FF0000]", bg: "bg-red-50 border-red-200" },
  "youtube shorts": { icon: <YouTubeIcon />, color: "text-[#FF0000]", bg: "bg-red-50 border-red-200" },
};

const platformLabel = (p: string) => {
  const v = p.toLowerCase();
  if (v === "twitter" || v === "x") return "Twitter/X";
  if (v === "linkedin") return "LinkedIn";
  if (v === "instagram") return "Instagram";
  if (v === "threads") return "Threads";
  if (v === "reddit") return "Reddit";
  if (v === "youtube") return "YouTube";
  if (v === "youtube shorts") return "YouTube Shorts";
  return p;
};

interface BeautifulContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generation: ContentGeneration | null;
  notes?: ProjectNote[];
}

const BeautifulContentModal = ({ open, onOpenChange, generation, notes }: BeautifulContentModalProps) => {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const currentPlatform = useMemo(() => {
    if (!generation) return null;
    const platform = selectedPlatform || generation.outputs[0]?.platform?.toLowerCase() || "linkedin";
    return generation.outputs.find((o) => o.platform?.toLowerCase() === platform) || generation.outputs[0];
  }, [generation, selectedPlatform]);

  if (!generation || !currentPlatform) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentPlatform.content || "");
    setCopiedPlatform(currentPlatform.platform || "");
    setTimeout(() => setCopiedPlatform(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Header with platform tabs */}
              <div className="border-b bg-gradient-to-r from-muted/50 to-transparent p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Generated Content
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {generation.created_at ? format(new Date(generation.created_at), "MMMM d, yyyy 'at' h:mm a") : ""}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenChange(false)}
                    className="p-2 rounded-full hover:bg-muted transition-all ml-4 flex-shrink-0"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                </div>

                {/* Platform selection tabs */}
                <div className="flex gap-2 flex-wrap">
                  {generation.outputs.map((output, i) => {
                    const platform = output.platform?.toLowerCase() || "linkedin";
                    const config = platformConfig[platform] || platformConfig.linkedin;
                    const isActive = selectedPlatform === platform || (!selectedPlatform && i === 0);

                    return (
                      <motion.button
                        key={output.id}
                        onClick={() => setSelectedPlatform(platform)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border font-medium ${
                          isActive
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-transparent bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <span className={`flex-shrink-0 ${config.color}`}>{config.icon}</span>
                        <span className="text-sm">{platformLabel(platform)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                  {/* Original Input */}
                  {generation.original_input && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100">
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
                          Your Idea
                        </Badge>
                        {generation.input_type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {generation.input_type}
                          </Badge>
                        )}
                      </div>
                      <div className="rounded-xl border bg-blue-50/50 border-blue-100 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                        {generation.original_input}
                      </div>
                    </motion.div>
                  )}

                  {/* Generated Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`p-2.5 rounded-xl border ${platformConfig[currentPlatform.platform?.toLowerCase() || "linkedin"].bg}`}
                      >
                        <span className={platformConfig[currentPlatform.platform?.toLowerCase() || "linkedin"].color}>
                          {platformConfig[currentPlatform.platform?.toLowerCase() || "linkedin"].icon}
                        </span>
                      </motion.div>
                      <div className="flex-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold mb-1">
                          Generated Content
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {(currentPlatform.content || "").length} characters
                        </p>
                      </div>
                    </div>

                    {/* Content Box */}
                    <motion.div
                      whileHover={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.12)" }}
                      className="rounded-xl border bg-background p-5 shadow-sm transition-all"
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {currentPlatform.content}
                      </p>
                    </motion.div>

                    {/* Copy Button */}
                    <div className="flex justify-end pt-1">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          onClick={handleCopy}
                          className={`gap-2 rounded-xl font-semibold transition-all ${
                            copiedPlatform === (currentPlatform.platform || "")
                              ? "bg-primary"
                              : ""
                          }`}
                          variant={copiedPlatform === (currentPlatform.platform || "") ? "default" : "hero"}
                        >
                          {copiedPlatform === (currentPlatform.platform || "") ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy to clipboard
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Notes Section */}
                  {notes && notes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-3 pt-4 border-t"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-100">
                          <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-semibold">
                          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {notes.map((note, i) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.03 }}
                            className="rounded-xl border-l-4 border-l-amber-400 bg-amber-50/50 p-4"
                          >
                            <p className="text-xs text-amber-600 font-semibold mb-2">
                              {note.created_at ? format(new Date(note.created_at), "MMM d, yyyy") : ""}
                            </p>
                            <p className="text-sm whitespace-pre-wrap break-words">{note.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BeautifulContentModal;
