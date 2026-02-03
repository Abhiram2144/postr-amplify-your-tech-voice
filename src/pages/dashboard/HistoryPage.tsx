import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Copy,
  Check,
  Clock,
  Filter,
} from "lucide-react";

interface HistoryItem {
  id: string;
  platform: string;
  content: string;
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

const platformColors: Record<string, string> = {
  linkedin: "bg-blue-500/10 text-blue-600 border-blue-200",
  x: "bg-gray-800/10 text-gray-800 border-gray-300",
  threads: "bg-purple-500/10 text-purple-600 border-purple-200",
  reddit: "bg-orange-500/10 text-orange-600 border-orange-200",
  video: "bg-red-500/10 text-red-600 border-red-200",
};

const HistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Placeholder history - empty for now
  const history: HistoryItem[] = [];

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || item.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">Your past generated content</p>
        </div>

        {/* Filters */}
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="x">X</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="video">Video Scripts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
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
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No history yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  When you generate content, it will appear here for easy reference and reuse.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {filteredHistory.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${platformColors[item.platform] || "bg-muted text-muted-foreground"}`}>
                          {item.platform}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.createdAt}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.id, item.content)}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                        {item.content}
                      </p>
                    </div>
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

export default HistoryPage;
