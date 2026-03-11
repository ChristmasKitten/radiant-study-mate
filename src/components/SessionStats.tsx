import { useState } from "react";
import { BookOpen, Clock, Flame, Target, Timer, Trash2 } from "lucide-react";
import { SubjectTime, DailyRecord } from "@/hooks/useStudyTimer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
  allTimeTotalSeconds: number;
  bestDaySeconds: number;
  currentSubject: string;
  subjects: string[];
  subjectTimes: SubjectTime[];
  currentStreak: number;
  dailyGoal: number;
  dailyRecords?: DailyRecord[];
  onTodayClick?: () => void;
  onDeleteSession?: (date: string) => void;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function SessionStats({
  sessionsCompleted,
  totalFocusTime,
  allTimeTotalSeconds,
  bestDaySeconds,
  currentSubject,
  subjectTimes,
  currentStreak,
  dailyGoal,
  dailyRecords,
  onTodayClick,
  onDeleteSession,
}: SessionStatsProps) {
  const [showSessions, setShowSessions] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const subjectTime = subjectTimes.find((s) => s.subject === currentSubject) ?? { totalSeconds: 0, sessions: 0 };

  // Show all subjects' focus time
  const totalAllSubjects = subjectTimes.reduce((sum, s) => sum + s.totalSeconds, 0);

  return (
    <>
      <div className="w-full max-w-md space-y-2">
        {/* All subjects summary */}
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">{currentSubject}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-xs font-bold text-foreground">{formatTime(subjectTime.totalSeconds)}</p>
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Subject</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs font-bold text-foreground">{formatTime(totalAllSubjects)}</p>
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground">All Subjects</p>
            </div>
          </div>
        </div>

        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { icon: Flame, label: "Streak", value: currentStreak > 0 ? `${currentStreak}d` : "—", color: "text-destructive", tooltip: "Active daily streak" },
              { icon: Clock, label: "Today", value: `${Math.floor(totalFocusTime / 60)}m / ${dailyGoal}m`, color: "text-timer-warn", tooltip: bestDaySeconds > 0 ? `Best day: ${formatTime(bestDaySeconds)}` : "Focus time today" },
              { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary", tooltip: "Total focus time" },
              { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary", tooltip: "Click to manage sessions", clickable: true },
            ].map((stat) => (
              <Tooltip key={stat.label}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-card p-2 hover:bg-accent/5 transition-colors ${
                      stat.label === "Today" || (stat as any).clickable ? "cursor-pointer" : "cursor-help"
                    }`}
                    onClick={
                      stat.label === "Today" ? onTodayClick :
                      (stat as any).clickable ? () => setShowSessions(true) :
                      undefined
                    }
                  >
                    <stat.icon className={`h-3 w-3 ${stat.color}`} />
                    <span className="text-center font-mono text-xs font-bold leading-none text-foreground">{stat.value}</span>
                    <span className="text-center text-[8px] uppercase tracking-widest leading-none text-muted-foreground">{stat.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{stat.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Session history dialog */}
      <Dialog open={showSessions} onOpenChange={setShowSessions}>
        <DialogContent className="max-w-sm max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Session History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 mt-2">
            {(!dailyRecords || dailyRecords.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">No sessions recorded yet.</p>
            ) : (
              [...dailyRecords].reverse().map((record) => (
                <div key={record.date} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{record.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(record.totalSeconds)} • {record.sessions} session{record.sessions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {onDeleteSession && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(record.date)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="h-4 w-4 text-destructive" />
              Delete Session
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete all study data for <span className="font-semibold text-foreground">{deleteTarget}</span>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget && onDeleteSession) onDeleteSession(deleteTarget);
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
