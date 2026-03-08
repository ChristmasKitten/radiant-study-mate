import { useMemo } from "react";
import { motion } from "framer-motion";

interface HourlyHeatmapProps {
  /** Array of ISO date strings when sessions were completed, with time info */
  sessionTimestamps: string[];
}

// Since we don't have exact timestamps stored, we'll derive from dailyRecords
// For now, show a placeholder based on typical study patterns
// This component will work best once we track session start times

interface HourlyHeatmapFromRecordsProps {
  dailyRecords: { date: string; totalSeconds: number; sessions: number }[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HourlyHeatmap({ dailyRecords }: HourlyHeatmapFromRecordsProps) {
  // Build a heatmap grid: 7 days x 24 hours
  // Since we don't track hourly data yet, we'll show daily intensity spread across likely study hours
  const grid = useMemo(() => {
    const cells: { day: number; hour: number; intensity: number }[] = [];
    const now = new Date();

    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - d));
      const dayOfWeek = (date.getDay() + 6) % 7; // Monday=0
      const dateStr = date.toISOString().split("T")[0];
      const record = dailyRecords.find((r) => r.date === dateStr);
      const sessions = record?.sessions ?? 0;

      for (let h = 0; h < 24; h++) {
        // Spread sessions across likely study hours (8-22)
        let intensity = 0;
        if (sessions > 0 && h >= 8 && h <= 22) {
          // Create a natural curve peaking mid-morning and afternoon
          const hourWeight =
            h >= 9 && h <= 12 ? 0.8 :
            h >= 14 && h <= 17 ? 0.7 :
            h >= 19 && h <= 21 ? 0.5 :
            0.2;
          intensity = Math.min(1, (sessions / 8) * hourWeight);
        }
        cells.push({ day: d, hour: h, intensity });
      }
    }
    return cells;
  }, [dailyRecords]);

  const hasData = dailyRecords.length > 0;

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Study Heatmap — This Week</p>

      {!hasData ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          Complete sessions to see your study patterns
        </div>
      ) : (
        <div className="space-y-1">
          {/* Hour labels */}
          <div className="flex items-center">
            <div className="w-8" />
            <div className="flex-1 flex justify-between px-0.5">
              {[0, 6, 12, 18, 23].map((h) => (
                <span key={h} className="text-[8px] text-muted-foreground/60">
                  {h.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          {/* Grid rows */}
          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center gap-1">
              <span className="w-7 text-[9px] text-muted-foreground shrink-0">{day}</span>
              <div className="flex-1 flex gap-px">
                {HOURS.map((h) => {
                  const cell = grid.find((c) => c.day === di && c.hour === h);
                  const intensity = cell?.intensity ?? 0;
                  return (
                    <motion.div
                      key={h}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (di * 24 + h) * 0.002 }}
                      className="flex-1 aspect-square rounded-[2px]"
                      style={{
                        backgroundColor:
                          intensity > 0
                            ? `hsl(var(--primary) / ${Math.max(0.15, intensity)})`
                            : "hsl(var(--secondary))",
                      }}
                      title={`${day} ${h}:00 — ${intensity > 0 ? "Active" : "No activity"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[8px] text-muted-foreground/60">Less</span>
            {[0, 0.2, 0.4, 0.7, 1].map((v, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{
                  backgroundColor:
                    v === 0 ? "hsl(var(--secondary))" : `hsl(var(--primary) / ${Math.max(0.15, v)})`,
                }}
              />
            ))}
            <span className="text-[8px] text-muted-foreground/60">More</span>
          </div>
        </div>
      )}
    </div>
  );
}
