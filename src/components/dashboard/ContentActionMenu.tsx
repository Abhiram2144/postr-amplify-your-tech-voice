import { useState } from "react";
import { MoreVertical, Copy, Eye, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface ContentActionMenuProps {
  onView: () => void;
  onCopy: () => void;
  onDelete?: () => void;
  isCopied?: boolean;
}

export const ContentActionMenu = ({
  onView,
  onCopy,
  onDelete,
  isCopied = false,
}: ContentActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onView();
            setIsOpen(false);
          }}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4 text-primary" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
            setIsOpen(false);
          }}
          className="cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4 text-primary" />
              <span>Copy Content</span>
            </>
          )}
        </DropdownMenuItem>

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setIsOpen(false);
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
