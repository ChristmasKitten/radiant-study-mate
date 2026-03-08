import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DailyRecord } from "@/hooks/useStudyTimer";

interface StudyGraphProps {
  dailyRecords: DailyRecord[];
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StudyGraph({ dailyRecords }: StudyGraphProps) {
  const data = useMemo(() => {
    const days: { date: string; label: string; minutes: number; totalSeconds: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const existing = dailyRecords.find((r) => r.date === dateStr);
      const totalSeconds = existing?.totalSeconds ?? 0;
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        minutes: Math.round(totalSeconds / 60),
        totalSeconds,
      });
    }
    return days;
  }, [dailyRecords]);

  const hasData = data.some((d) => d.minutes > 0);

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="mb-4 text-[10px] uppercase tracking-widest text-muted-foreground">Study Trend — Last 30 Days</p>

      {!hasData ? (
        <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
          Complete a session to see your study trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickCount={5}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-lg">
                    <p className="text-[10px] text-muted-foreground">{d.label}</p>
                    <p className="font-mono text-sm font-bold text-primary">{formatTime(d.totalSeconds)}</p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#studyGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
