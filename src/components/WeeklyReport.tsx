import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, Target, Flame, TrendingUp } from "lucide-react";
import { DailyRecord, SubjectTime } from "@/hooks/useStudyTimer";

interface WeeklyReportProps {
  dailyRecords: DailyRecord[];
  subjectTimes: SubjectTime[];
  currentStreak: number;
  level: number;
  xp: number;
  getSubjectColor: (subject: string) => string;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function WeeklyReport({
  dailyRecords,
  subjectTimes,
  currentStreak,
  level,
  xp,
  getSubjectColor
}: WeeklyReportProps) {
  const weekData = useMemo(() => {
    const days: DailyRecord[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const existing = dailyRecords.find((r) => r.date === dateStr);
      days.push(existing ?? { date: dateStr, totalSeconds: 0, sessions: 0 });
    }
    return days;
  }, [dailyRecords]);

  const weekTotal = weekData.reduce((s, d) => s + d.totalSeconds, 0);
  const weekSessions = weekData.reduce((s, d) => s + d.sessions, 0);
  const avgPerDay = weekTotal / 7;
  const bestDay = weekData.reduce((best, d) => d.totalSeconds > best.totalSeconds ? d : best, weekData[0]);
  const activeDays = weekData.filter((d) => d.totalSeconds > 0).length;

  const prevWeekData = useMemo(() => {
    let total = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const existing = dailyRecords.find((r) => r.date === dateStr);
      total += existing?.totalSeconds ?? 0;
    }
    return total;
  }, [dailyRecords]);

  const trend = prevWeekData > 0 ? (weekTotal - prevWeekData) / prevWeekData * 100 : weekTotal > 0 ? 100 : 0;

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Weekly Report</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Total Time</span>
          </div>
          <p className="font-mono text-lg font-bold text-foreground">{formatTime(weekTotal)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className={`h-2.5 w-2.5 ${trend >= 0 ? "text-primary" : "text-destructive"}`} />
            <span className={`text-[10px] font-medium ${trend >= 0 ? "text-primary" : "text-destructive"}`}>
              {trend >= 0 ? "+" : ""}{Math.round(trend)}% vs last week
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3 w-3 text-timer-warn" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Sessions</span>
          </div>
          <p className="font-mono text-lg font-bold text-foreground">{weekSessions}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{activeDays}/7 active days</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="font-mono text-sm font-bold text-foreground">{formatTime(Math.round(avgPerDay))}</p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Avg/Day</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="font-mono text-sm font-bold text-foreground flex items-center justify-center gap-1">
            <Flame className="h-3 w-3 text-destructive" />{currentStreak}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Streak</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="font-mono text-sm font-bold text-foreground">Lv{level}</p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{xp} XP</p>
        </div>
      </div>

      {/* Subject breakdown with colors */}
      {subjectTimes.length > 0 &&
      <div className="rounded-xl border border-border bg-card p-4 my-[12px]">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Subject Breakdown</p>
          <div className="space-y-2.5">
            {subjectTimes.
          sort((a, b) => b.totalSeconds - a.totalSeconds).
          slice(0, 6).
          map((st) => {
            const total = subjectTimes.reduce((s, t) => s + t.totalSeconds, 0);
            const pct = total > 0 ? st.totalSeconds / total * 100 : 0;
            const color = getSubjectColor(st.subject);
            return (
              <div key={st.subject} className="flex items-center gap-3">
                    <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="w-20 truncate text-xs font-medium text-foreground">{st.subject}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }} />
                  
                    </div>
                    <span className="w-14 text-right font-mono text-[11px] text-muted-foreground">
                      {formatTime(st.totalSeconds)}
                    </span>
                  </div>);

          })}
          </div>
        </div>
      }
    </div>);

}