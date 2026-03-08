import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BarChart3, ListTodo } from "lucide-react";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useTaskList } from "@/hooks/useTaskList";
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
import { FocusSounds } from "@/components/FocusSounds";
import { Button } from "@/components/ui/button";

type View = "timer" | "analytics" | "tasks";

const Index = () => {
  const timer = useStudyTimer();
  const { isDark, toggle: toggleTheme, colorTheme, setColor } = useThemeToggle();
  const taskList = useTaskList();
  const [view, setView] = useState<View>("timer");

  const pendingForCurrent = taskList.pendingCount(timer.currentSubject);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-6 selection:bg-primary/30">
      {/* Top bar */}
      <div className="flex w-full max-w-md items-center justify-between mb-6">
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
            className="flex flex-col items-center w-full"
          >
            {/* Motivational Quote */}
            <div className="mb-5">
              <MotivationalQuote />
            </div>

            {/* Mode Selector */}
            <div className="mb-5">
              <ModeSelector currentMode={timer.mode} onModeChange={timer.setMode} />
            </div>

            {/* Subject Selector */}
            <div className="mb-7">
              <SubjectSelector
                subjects={timer.subjects}
                currentSubject={timer.currentSubject}
                onSelect={timer.setCurrentSubject}
                onAdd={timer.addSubject}
                onRemove={timer.removeSubject}
                disabled={timer.isRunning}
              />
            </div>

            {/* Timer */}
            <div className="mb-7">
              <CircularTimer
                timeLeft={timer.timeLeft}
                progress={timer.progress}
                mode={timer.mode}
                isRunning={timer.isRunning}
              />
            </div>

            {/* Controls */}
            <div className="mb-8">
              <TimerControls
                isRunning={timer.isRunning}
                onStart={timer.start}
                onPause={timer.pause}
                onReset={timer.reset}
              />
            </div>

            {/* Stats */}
            <SessionStats
              sessionsCompleted={timer.sessionsCompleted}
              totalFocusTime={timer.totalFocusTime}
              allTimeTotalSeconds={timer.allTimeTotalSeconds}
              bestDaySeconds={timer.bestDayRecord?.totalSeconds ?? 0}
              currentSubject={timer.currentSubject}
              subjectTimes={timer.subjectTimes}
            />

            {/* Focus Sounds */}
            <div className="mt-4">
              <FocusSounds />
            </div>

            <p className="mt-6 text-xs text-muted-foreground/50">
              {timer.customDurations.focus}min focus • {timer.customDurations.shortBreak}min break • Data saved locally
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
