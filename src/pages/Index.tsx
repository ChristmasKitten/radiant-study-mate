import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BarChart3, ListTodo, FileText } from "lucide-react";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useTaskList } from "@/hooks/useTaskList";
import { useInactivityMode } from "@/hooks/useInactivityMode";
import { useGamification } from "@/hooks/useGamification";
import { useExamCountdown } from "@/hooks/useExamCountdown";
import { useReminders } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
import { getSessionReminderQuote } from "@/lib/motivationalQuotes";
import { fireSessionComplete, fireLevelUp } from "@/lib/celebrations";
import { CircularTimer } from "@/components/CircularTimer";
import { TimerControls } from "@/components/TimerControls";
import { ModeSelector } from "@/components/ModeSelector";
import { SessionStats } from "@/components/SessionStats";
import { SubjectSelector } from "@/components/SubjectSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TaskList } from "@/components/TaskList";
import { MotivationalQuote } from "@/components/MotivationalQuote";
import { FocusMediaEmbed } from "@/components/FocusMediaEmbed";
import { GamificationBar } from "@/components/GamificationBar";
import { ExamCountdown } from "@/components/ExamCountdown";
import { WeeklyReport } from "@/components/WeeklyReport";
import { Button } from "@/components/ui/button";

type View = "timer" | "analytics" | "tasks" | "report";

const Index = () => {
  const timer = useStudyTimer();
  const { isDark, toggle: toggleTheme, colorTheme, setColor } = useThemeToggle();
  const taskList = useTaskList();
  const gamification = useGamification();
  const examCountdown = useExamCountdown();
  const [view, setView] = useState<View>("timer");

  useReminders({ isRunning: timer.isRunning });

  const pendingForCurrent = taskList.pendingCount(timer.currentSubject);
  const inactivityMode = useInactivityMode({
    timeoutMs: 20_000,
    enabled: view === "timer" && timer.isRunning,
  });
  const hideChrome = view === "timer" && inactivityMode;

  const prevLevelRef = useRef(gamification.level);

  // Listen for session complete events
  useEffect(() => {
    const handler = () => {
      fireSessionComplete();
      const prevLevel = prevLevelRef.current;
      gamification.awardSessionXP();
      // Check level up after a tick
      setTimeout(() => {
        if (gamification.level > prevLevel) {
          fireLevelUp();
          toast({ title: "🎉 Level Up!", description: `You reached Level ${gamification.level}!` });
        }
        prevLevelRef.current = gamification.level;
      }, 100);
    };
    window.addEventListener("studyflow:session-complete", handler);
    return () => window.removeEventListener("studyflow:session-complete", handler);
  }, [gamification]);

  const handleStart = () => {
    const quote = getSessionReminderQuote();
    toast({
      title: "Focus reminder",
      description: `"${quote.text}" — ${quote.author}`,
    });
    timer.start();
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-6 selection:bg-primary/30">
      {!hideChrome && (
        <div className="mb-6 flex w-full max-w-md items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Study<span className="text-primary">Flow</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView((v) => (v === "tasks" ? "timer" : "tasks"))}
              className={`relative h-9 w-9 rounded-full ${view === "tasks" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ListTodo className="h-4 w-4" />
              {pendingForCurrent > 0 && view !== "tasks" && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {pendingForCurrent}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView((v) => (v === "analytics" ? "timer" : "analytics"))}
              className={`h-9 w-9 rounded-full ${view === "analytics" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView((v) => (v === "report" ? "timer" : "report"))}
              className={`h-9 w-9 rounded-full ${view === "report" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <SettingsPanel
              durations={timer.customDurations}
              onDurationsChange={timer.setCustomDurations}
              colorTheme={colorTheme}
              onColorChange={setColor}
              disabled={timer.isRunning}
            />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "analytics" ? (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center"
          >
            <AnalyticsPanel
              dailyRecords={timer.dailyRecords}
              last7Days={timer.last7Days}
              bestDayRecord={timer.bestDayRecord}
              avgDailyTime={timer.avgDailyTime}
              allTimeTotalSeconds={timer.allTimeTotalSeconds}
              subjectTimes={timer.subjectTimes}
            />
          </motion.div>
        ) : view === "report" ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center"
          >
            <WeeklyReport
              dailyRecords={timer.dailyRecords}
              subjectTimes={timer.subjectTimes}
              currentStreak={gamification.currentStreak}
              level={gamification.level}
              xp={gamification.xp}
              getSubjectColor={gamification.getSubjectColor}
            />
          </motion.div>
        ) : view === "tasks" ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center gap-4"
          >
            <SubjectSelector
              subjects={timer.subjects}
              currentSubject={timer.currentSubject}
              onSelect={timer.setCurrentSubject}
              onAdd={timer.addSubject}
              onRemove={timer.removeSubject}
              disabled={false}
              getSubjectColor={gamification.getSubjectColor}
              onColorChange={gamification.setSubjectColor}
              palette={gamification.palette}
            />
            <TaskList
              subject={timer.currentSubject}
              tasks={taskList.getTasksForSubject(timer.currentSubject)}
              onAdd={taskList.addTask}
              onToggle={taskList.toggleTask}
              onRemove={taskList.removeTask}
            />
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex w-full flex-col items-center ${inactivityMode ? "min-h-[72vh] justify-center" : ""}`}
          >
            {inactivityMode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1.08 }}
                className="flex flex-col items-center"
              >
                <CircularTimer
                  timeLeft={timer.timeLeft}
                  progress={timer.progress}
                  mode={timer.mode}
                  isRunning={timer.isRunning}
                />
                <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Inactive focus mode — move mouse or press a key to return
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-5">
                  <MotivationalQuote />
                </div>

                <div className="mb-4">
                  <GamificationBar
                    xp={gamification.xp}
                    level={gamification.level}
                    levelProgress={gamification.levelProgress}
                    xpInCurrentLevel={gamification.xpInCurrentLevel}
                    xpNeededForNext={gamification.xpNeededForNext}
                    currentStreak={gamification.currentStreak}
                    longestStreak={gamification.longestStreak}
                  />
                </div>

                <div className="mb-5">
                  <ModeSelector currentMode={timer.mode} onModeChange={timer.setMode} />
                </div>

                <div className="mb-7">
                  <SubjectSelector
                    subjects={timer.subjects}
                    currentSubject={timer.currentSubject}
                    onSelect={timer.setCurrentSubject}
                    onAdd={timer.addSubject}
                    onRemove={timer.removeSubject}
                    disabled={timer.isRunning}
                    getSubjectColor={gamification.getSubjectColor}
                    onColorChange={gamification.setSubjectColor}
                    palette={gamification.palette}
                  />
                </div>

                <div className="mb-7">
                  <CircularTimer
                    timeLeft={timer.timeLeft}
                    progress={timer.progress}
                    mode={timer.mode}
                    isRunning={timer.isRunning}
                  />
                </div>

                <div className="mb-8">
                  <TimerControls
                    isRunning={timer.isRunning}
                    onStart={handleStart}
                    onPause={timer.pause}
                    onReset={timer.reset}
                  />
                </div>

                <SessionStats
                  sessionsCompleted={timer.sessionsCompleted}
                  totalFocusTime={timer.totalFocusTime}
                  allTimeTotalSeconds={timer.allTimeTotalSeconds}
                  bestDaySeconds={timer.bestDayRecord?.totalSeconds ?? 0}
                  currentSubject={timer.currentSubject}
                  subjectTimes={timer.subjectTimes}
                />

                <div className="mt-4">
                  <ExamCountdown
                    exams={examCountdown.exams}
                    onAdd={examCountdown.addExam}
                    onRemove={examCountdown.removeExam}
                  />
                </div>

                <div className="mt-4">
                  <FocusMediaEmbed />
                </div>

                <p className="mt-6 text-xs text-muted-foreground/50">
                  {timer.customDurations.focus}min focus • {timer.customDurations.shortBreak}min break • Data saved locally
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
