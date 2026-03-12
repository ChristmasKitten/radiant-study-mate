import { useMemo } from "react";
import { motion } from "framer-motion";
import { Dna } from "lucide-react";
import { DailyRecord, SubjectTime } from "@/hooks/useStudyTimer";

interface FocusDNAProps {
  dailyRecords: DailyRecord[];
  subjectTimes: SubjectTime[];
  sessionsCompleted: number;
  totalFocusTime: number;
}

// Derive behavioral traits from study data
function analyzeTraits(
  dailyRecords: DailyRecord[],
  subjectTimes: SubjectTime[],
  sessionsCompleted: number,
  totalFocusTime: number
) {
  const traits: { label: string; value: number; color: string }[] = [];

  // 1. Session length tendency (long vs short)
  const avgSessionLen = sessionsCompleted > 0 ? totalFocusTime / sessionsCompleted : 0;
  const longSessionScore = Math.min(1, avgSessionLen / 3600); // 1h = max
  traits.push({ label: longSessionScore > 0.5 ? "Marathon Runner" : "Sprint Learner", value: longSessionScore, color: "hsl(var(--primary))" });

  // 2. Consistency (how many days active out of last 30)
  const last30 = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last30.add(d.toISOString().split("T")[0]);
  }
  const activeDays = dailyRecords.filter(r => last30.has(r.date) && r.totalSeconds > 0).length;
  const consistencyScore = Math.min(1, activeDays / 20);
  traits.push({ label: consistencyScore > 0.6 ? "Steady Climber" : "Burst Studier", value: consistencyScore, color: "hsl(var(--accent))" });

  // 3. Subject diversity
  const diversityScore = Math.min(1, subjectTimes.length / 6);
  traits.push({ label: diversityScore > 0.5 ? "Renaissance Mind" : "Deep Specialist", value: diversityScore, color: "hsl(142 71% 45%)" });

  // 4. Volume (total hours)
  const totalHours = totalFocusTime / 3600;
  const volumeScore = Math.min(1, totalHours / 50);
  traits.push({ label: volumeScore > 0.5 ? "Heavy Hitter" : "Getting Started", value: volumeScore, color: "hsl(280 70% 55%)" });

  // 5. Streak pattern (recent activity density)
  const last7Active = dailyRecords.filter(r => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return r.date >= d.toISOString().split("T")[0] && r.totalSeconds > 0;
  }).length;
  const recentScore = Math.min(1, last7Active / 6);
  traits.push({ label: recentScore > 0.6 ? "On Fire" : "Warming Up", value: recentScore, color: "hsl(25 95% 53%)" });

  // 6. Peak intensity (best day relative to average)
  const avgDaily = dailyRecords.length > 0 ? dailyRecords.reduce((s, r) => s + r.totalSeconds, 0) / Math.max(dailyRecords.length, 1) : 0;
  const bestDay = dailyRecords.reduce((best, r) => r.totalSeconds > best ? r.totalSeconds : best, 0);
  const peakScore = avgDaily > 0 ? Math.min(1, (bestDay / avgDaily) / 5) : 0;
  traits.push({ label: peakScore > 0.5 ? "Peak Performer" : "Even Pacer", value: peakScore, color: "hsl(340 75% 55%)" });

  return traits;
}

// Generate DNA strand segments from trait values
function generateStrand(traits: { value: number; color: string }[], segments: number) {
  const strand: { left: number; right: number; color: string; pairColor: string }[] = [];
  for (let i = 0; i < segments; i++) {
    const traitIdx = i % traits.length;
    const trait = traits[traitIdx];
    // Create wave pattern using sine
    const phase = (i / segments) * Math.PI * 4 + trait.value * Math.PI;
    const leftX = 30 + Math.sin(phase) * 20 * (0.5 + trait.value * 0.5);
    const rightX = 70 - Math.sin(phase) * 20 * (0.5 + trait.value * 0.5);
    strand.push({ left: leftX, right: rightX, color: trait.color, pairColor: traits[(traitIdx + 3) % traits.length].color });
  }
  return strand;
}

export function FocusDNA({ dailyRecords, subjectTimes, sessionsCompleted, totalFocusTime }: FocusDNAProps) {
  const traits = useMemo(
    () => analyzeTraits(dailyRecords, subjectTimes, sessionsCompleted, totalFocusTime),
    [dailyRecords, subjectTimes, sessionsCompleted, totalFocusTime]
  );

  const strand = useMemo(() => generateStrand(traits, 30), [traits]);
  const hasData = sessionsCompleted > 0;

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Dna className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Focus DNA</h3>
      </div>

      {!hasData ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          Complete sessions to generate your unique Focus DNA
        </div>
      ) : (
        <div className="space-y-4">
          {/* DNA Helix visualization */}
          <div className="relative mx-auto" style={{ width: "100%", height: 240 }}>
            <svg viewBox="0 0 100 240" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {strand.map((seg, i) => {
                const y = 8 + (i / strand.length) * 224;
                return (
                  <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    {/* Left backbone */}
                    <circle cx={seg.left} cy={y} r={2.2} fill={seg.color} opacity={0.9} />
                    {/* Right backbone */}
                    <circle cx={seg.right} cy={y} r={2.2} fill={seg.pairColor} opacity={0.9} />
                    {/* Base pair connection */}
                    <line
                      x1={seg.left + 2} y1={y}
                      x2={seg.right - 2} y2={y}
                      stroke={seg.color}
                      strokeWidth={0.8}
                      opacity={0.25}
                    />
                    {/* Backbone connections */}
                    {i > 0 && (
                      <>
                        <line
                          x1={strand[i - 1].left} y1={8 + ((i - 1) / strand.length) * 224}
                          x2={seg.left} y2={y}
                          stroke={seg.color} strokeWidth={1.2} opacity={0.5}
                        />
                        <line
                          x1={strand[i - 1].right} y1={8 + ((i - 1) / strand.length) * 224}
                          x2={seg.right} y2={y}
                          stroke={seg.pairColor} strokeWidth={1.2} opacity={0.5}
                        />
                      </>
                    )}
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Trait labels */}
          <div className="grid grid-cols-2 gap-2">
            {traits.map((trait) => (
              <div key={trait.label} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-2.5 py-1.5">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: trait.color }} />
                <span className="text-[10px] font-medium text-foreground truncate">{trait.label}</span>
                <div className="ml-auto flex-shrink-0 h-1 w-8 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: trait.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.value * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
