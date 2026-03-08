import { useState } from "react";
import { Plus, X, BookOpen, Trash2, Palette } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SubjectSelectorProps {
  subjects: string[];
  currentSubject: string;
  onSelect: (subject: string) => void;
  onAdd: (subject: string) => void;
  onRemove: (subject: string) => void;
  disabled?: boolean;
  getSubjectColor?: (subject: string) => string;
  onColorChange?: (subject: string, color: string) => void;
  palette?: string[];
}

export function SubjectSelector({
  subjects,
  currentSubject,
  onSelect,
  onAdd,
  onRemove,
  disabled,
  getSubjectColor,
  onColorChange,
  palette,
}: SubjectSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [colorTarget, setColorTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newSubject.trim() || disabled) return;
    onAdd(newSubject.trim());
    setNewSubject("");
    setIsAdding(false);
  };

  return (
    <>
      <div className="flex w-full max-w-md flex-col items-center gap-2.5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span>Studying</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {subjects.map((subject) => {
            const color = getSubjectColor?.(subject);
            const isActive = currentSubject === subject;
            const isColorOpen = colorTarget === subject;

            return (
              <div key={subject} className="group relative">
                <button
                  onClick={() => !disabled && onSelect(subject)}
                  className={`flex min-w-[106px] items-center justify-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium ${
                    isActive && color && color !== "none"
                      ? "border-transparent text-primary-foreground"
                      : isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  style={isActive && color && color !== "none" ? { backgroundColor: color } : undefined}
                  type="button"
                >
                  <span className="truncate">{subject}</span>
                </button>

                {!disabled && subjects.length > 1 && (
                  <span
                    onClick={() => setDeleteTarget(subject)}
                    className="absolute -right-1 -top-1 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground group-hover:flex"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}

                {!disabled && onColorChange && (
                  <Popover
                    open={isColorOpen}
                    onOpenChange={(open) => setColorTarget(open ? subject : null)}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setColorTarget(isColorOpen ? null : subject);
                        }}
                        className={`absolute -left-1 -top-1 h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground ${
                          isColorOpen ? "flex" : "hidden group-hover:flex"
                        }`}
                      >
                        <Palette className="h-2.5 w-2.5" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-auto border-border bg-card p-2 pointer-events-auto"
                      side="top"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="grid grid-cols-8 gap-1">
                        {(palette ?? []).map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              onColorChange(subject, c);
                              setColorTarget(null);
                            }}
                            className={`h-5 w-5 rounded-full border-2 ${
                              getSubjectColor?.(subject) === c ? "border-foreground" : "border-transparent"
                            } ${c === "none" ? "bg-secondary flex items-center justify-center text-[8px] text-muted-foreground" : ""}`}
                            style={c !== "none" ? { backgroundColor: c } : undefined}
                            type="button"
                            title={c === "none" ? "No color" : c}
                          >
                            {c === "none" ? "✕" : ""}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            );
          })}

          {isAdding ? (
            <div className="flex items-center gap-1">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value.slice(0, 30))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") setIsAdding(false);
                }}
                placeholder="Subject"
                className="h-8 w-28 rounded-full border-border bg-secondary text-sm"
                autoFocus
                disabled={disabled}
              />
              <Button size="sm" onClick={handleAdd} className="h-8 rounded-full px-3 text-xs" disabled={!newSubject.trim() || disabled}>
                Add
              </Button>
            </div>
          ) : (
            <button
              onClick={() => !disabled && setIsAdding(true)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="h-4 w-4 text-destructive" />
              Delete Subject
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget}"</span>?
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
