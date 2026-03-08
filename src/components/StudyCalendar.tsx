import { useMemo } from "react";
import { DailyRecord } from "@/hooks/useStudyTimer";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface StudyCalendarProps {
  dailyRecords: DailyRecord[];
}

export function StudyCalendar({ dailyRecords }: StudyCalendarProps) {
  const recordMap = useMemo(() => {
    const map: Record<string, DailyRecord> = {};
    dailyRecords.forEach((r) => { map[r.date] = r; });
    return map;
  }, [dailyRecords]);

  const studiedDates = useMemo(() => {
    return dailyRecords.map((r) => new Date(r.date + "T00:00:00"));
  }, [dailyRecords]);

  const maxSeconds = useMemo(() => {
    return Math.max(...dailyRecords.map((r) => r.totalSeconds), 1);
  }, [dailyRecords]);

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Study Calendar</p>
      <Calendar
        mode="multiple"
        selected={studiedDates}
        className={cn("p-0 pointer-events-auto w-full")}
        modifiers={{
          studied: studiedDates,
        }}
        modifiersClassNames={{
          studied: "bg-primary/20 text-primary font-bold",
        }}
        disabled={() => true}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
          month: "space-y-3 w-full",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-xs font-medium text-foreground",
          nav: "space-x-1 flex items-center",
          nav_button: "h-6 w-6 bg-transparent p-0 text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[10px] uppercase",
          row: "flex w-full mt-1",
          cell: "flex-1 text-center text-xs p-0 relative focus-within:relative focus-within:z-20",
          day: "h-7 w-full p-0 font-normal text-[11px] rounded-md",
          day_today: "border border-primary/50 text-primary",
          day_outside: "text-muted-foreground/30",
          day_disabled: "cursor-default",
          day_selected: "bg-primary/20 text-primary font-bold",
        }}
      />

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/20 border border-primary/30" />
          <span>Studied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm border border-primary/50" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
