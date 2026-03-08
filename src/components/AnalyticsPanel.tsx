import { motion } from "framer-motion";
import { Trophy, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { DailyRecord, SubjectTime } from "@/hooks/useStudyTimer";
import { StudyGraph } from "@/components/StudyGraph";
import { StudyCalendar } from "@/components/StudyCalendar";
import { HourlyHeatmap } from "@/components/HourlyHeatmap";

interface AnalyticsPanelProps {
  dailyRecords: DailyRecord[];
  last7Days: DailyRecord[];
  bestDayRecord: DailyRecord | null;
  avgDailyTime: number;
  allTimeTotalSeconds: number;
  subjectTimes: SubjectTime[];
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function AnalyticsPanel({
  dailyRecords,
  last7Days,
  bestDayRecord,
  avgDailyTime,
  allTimeTotalSeconds,
  subjectTimes,
}: AnalyticsPanelProps) {
  const maxSeconds = Math.max(...last7Days.map((d) => d.totalSeconds), 1);

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-3">
          <Trophy className="h-3.5 w-3.5 text-timer-warn" />
          <span className="font-mono text-sm font-bold text-foreground">
            {bestDayRecord ? formatTime(bestDayRecord.totalSeconds) : "—"}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Best Day</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-3">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-sm font-bold text-foreground">{formatTime(avgDailyTime)}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Avg/Day</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-3">
          <Calendar className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono text-sm font-bold text-foreground">{formatTime(allTimeTotalSeconds)}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Total</span>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <HourlyHeatmap dailyRecords={dailyRecords} />

      {/* Stock-style graph */}
      <StudyGraph dailyRecords={dailyRecords} />

      {/* 7-day bar chart */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 7 Days</p>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-28">
          {last7Days.map((day, i) => {
            const height = maxSeconds > 0 ? (day.totalSeconds / maxSeconds) * 100 : 0;
            const isToday = i === last7Days.length - 1;
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="font-mono text-[9px] text-muted-foreground">
                  {day.totalSeconds > 0 ? formatTime(day.totalSeconds) : ""}
                </span>
                <div className="w-full flex items-end" style={{ height: "80px" }}>
                  <motion.div
                    className={`w-full rounded-t-md ${isToday ? "bg-primary" : "bg-secondary"}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
                <span className={`text-[9px] ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {formatDate(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar view */}
      <StudyCalendar dailyRecords={dailyRecords} />

      {/* Subject breakdown */}
      {subjectTimes.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Subject Breakdown</p>
          <div className="space-y-2">
            {subjectTimes
              .sort((a, b) => b.totalSeconds - a.totalSeconds)
              .map((st) => {
                const pct = allTimeTotalSeconds > 0 ? (st.totalSeconds / allTimeTotalSeconds) * 100 : 0;
                return (
                  <div key={st.subject} className="flex items-center gap-3">
                    <span className="w-20 truncate text-xs font-medium text-foreground">{st.subject}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground w-14 text-right">
                      {formatTime(st.totalSeconds)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
