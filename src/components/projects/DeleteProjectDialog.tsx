import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X, AlertTriangle } from "lucide-react";
import type { Project } from "@/hooks/useProjects";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onConfirm: () => void;
}

const DeleteProjectDialog = ({
  open,
  onOpenChange,
  project,
  onConfirm,
}: DeleteProjectDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
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
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 pointer-events-none" />

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
                <AlertDialogHeader className="space-y-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center"
                  >
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-center space-y-2"
                  >
                    <AlertDialogTitle className="text-xl font-bold">
                      Delete Project?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will permanently delete{" "}
                      <span className="font-semibold text-foreground">
                        "{project?.title}"
                      </span>{" "}
                      and all its contents and notes.
                    </AlertDialogDescription>
                  </motion.div>
                </AlertDialogHeader>

                {/* Warning box */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-5 p-3 rounded-xl bg-destructive/5 border border-destructive/20"
                >
                  <p className="text-sm text-destructive font-medium text-center">
                    ⚠️ This action cannot be undone
                  </p>
                </motion.div>

                <AlertDialogFooter className="mt-6 flex-col gap-2 sm:flex-col">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="w-full"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={onConfirm}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Project
                      </Button>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full"
                  >
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </AlertDialogFooter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectDialog;
