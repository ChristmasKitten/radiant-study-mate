import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubjectSelectorProps {
  subjects: string[];
  currentSubject: string;
  onSelect: (subject: string) => void;
  onAdd: (subject: string) => void;
  onRemove: (subject: string) => void;
  disabled?: boolean;
}

export function SubjectSelector({
  subjects,
  currentSubject,
  onSelect,
  onAdd,
  onRemove,
  disabled,
}: SubjectSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (newSubject.trim()) {
      onAdd(newSubject.trim());
      setNewSubject("");
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span>Studying</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {subjects.map((subject) => (
            <motion.button
              key={subject}
              layout
              onClick={() => !disabled && onSelect(subject)}
              className={`group relative rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                currentSubject === subject
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              whileTap={disabled ? {} : { scale: 0.95 }}
            >
              {subject}
              {!disabled && subjects.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(subject);
                  }}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground group-hover:flex cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              )}
            </motion.button>
          ))}

          <AnimatePresence>
            {isAdding ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1"
              >
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value.slice(0, 30))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") setIsAdding(false);
                  }}
                  placeholder="Subject name"
                  className="h-8 w-32 rounded-full bg-secondary border-border text-sm"
                  autoFocus
                  disabled={disabled}
                />
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="h-8 rounded-full px-3 text-xs"
                  disabled={!newSubject.trim() || disabled}
                >
                  Add
                </Button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => !disabled && setIsAdding(true)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary ${
                  disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Delete Subject
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget}"</span>? This won't remove your study history for this subject.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) onRemove(deleteTarget);
                setDeleteTarget(null);
              }}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
