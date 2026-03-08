import { useState, useEffect, useRef } from "react";
import { BookOpen, BarChart3, ListTodo, FileText, CalendarDays } from "lucide-react";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useTaskList } from "@/hooks/useTaskList";
import { useInactivityMode } from "@/hooks/useInactivityMode";
import { useGamification } from "@/hooks/useGamification";
import { useExamCountdown } from "@/hooks/useExamCountdown";
import { useReminders } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
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
import { GamificationBar } from "@/components/GamificationBar";
import { ExamCountdown } from "@/components/ExamCountdown";
import { WeeklyReport } from "@/components/WeeklyReport";
import { StudyCat } from "@/components/StudyCat";
import { AmbientMusic } from "@/components/AmbientMusic";
import { StudySchedule } from "@/components/StudySchedule";
import { Button } from "@/components/ui/button";

type View = "timer" | "analytics" | "tasks" | "report" | "schedule";

const Index = () => {
  const timer = useStudyTimer();
  const { isDark, toggle: toggleTheme, colorTheme, setColor } = useThemeToggle();
  const taskList = useTaskList();
  const gamification = useGamification();
  const examCountdown = useExamCountdown();
  const [view, setView] = useState<View>("timer");
  const [focusMode, setFocusMode] = useState(false);
  const [catVisible, setCatVisible] = useState(true);

  useReminders({ isRunning: timer.isRunning });

  const pendingForCurrent = taskList.pendingCount(timer.currentSubject);
  const inactivityMode = useInactivityMode({
    timeoutMs: 20_000,
    enabled: view === "timer" && timer.isRunning,
  });
  const hideChrome = view === "timer" && inactivityMode;

  const prevLevelRef = useRef(gamification.level);

  useEffect(() => {
    const handler = () => {
      fireSessionComplete();
      const prevLevel = prevLevelRef.current;
      gamification.awardSessionXP();
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
    timer.start();
  };

  // Fullscreen focus mode
  if (focusMode) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        onClick={(e) => {
          if (e.target === e.currentTarget) setFocusMode(false);
        }}
      >
        <div className="flex flex-col items-center gap-6">
          <CircularTimer
            timeLeft={timer.timeLeft}
            progress={timer.progress}
            mode={timer.mode}
            isRunning={timer.isRunning}
          />

          <TimerControls
            isRunning={timer.isRunning}
            onStart={handleStart}
            onPause={timer.pause}
            onReset={timer.reset}
          />

          <p className="text-xs text-muted-foreground/40">
            {timer.currentSubject} • Click outside to exit
          </p>
        </div>
        <StudyCat visible={catVisible} onHide={() => setCatVisible(false)} isRunning={timer.isRunning} mode={timer.mode} totalFocusTime={timer.totalFocusTime} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-6 selection:bg-primary/30">
      {!hideChrome && (
        <div className="mb-6 flex w-full max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Study<span className="text-primary">Flow</span>
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <GamificationBar
              xp={gamification.xp}
              level={gamification.level}
              levelProgress={gamification.levelProgress}
              xpInCurrentLevel={gamification.xpInCurrentLevel}
              xpNeededForNext={gamification.xpNeededForNext}
              currentStreak={gamification.currentStreak}
              longestStreak={gamification.longestStreak}
            />

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView((v) => (v === "schedule" ? "timer" : "schedule"))}
              className={`h-9 w-9 rounded-full ${view === "schedule" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <AmbientMusic />
            <SettingsPanel
              durations={timer.customDurations}
              onDurationsChange={timer.setCustomDurations}
              colorTheme={colorTheme}
              onColorChange={setColor}
              disabled={false}
              catVisible={catVisible}
              onCatToggle={setCatVisible}
            />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </div>
      )}

      {view === "analytics" && (
        <div className="flex w-full flex-col items-center">
          <AnalyticsPanel
            dailyRecords={timer.dailyRecords}
            last7Days={timer.last7Days}
            bestDayRecord={timer.bestDayRecord}
            avgDailyTime={timer.avgDailyTime}
            allTimeTotalSeconds={timer.allTimeTotalSeconds}
            subjectTimes={timer.subjectTimes}
            subjects={timer.subjects}
          />
        </div>
      )}

      {view === "report" && (
        <div className="flex w-full flex-col items-center">
          <WeeklyReport
            dailyRecords={timer.dailyRecords}
            subjectTimes={timer.subjectTimes}
            currentStreak={gamification.currentStreak}
            level={gamification.level}
            xp={gamification.xp}
            getSubjectColor={gamification.getSubjectColor}
          />
        </div>
      )}

      {view === "schedule" && (
        <div className="flex w-full flex-col items-center">
          <StudySchedule />
        </div>
      )}

      {view === "tasks" && (
        <div className="flex w-full flex-col items-center gap-4">
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
          <TaskList
            subject={timer.currentSubject}
            tasks={taskList.getTasksForSubject(timer.currentSubject)}
            onAdd={taskList.addTask}
            onToggle={taskList.toggleTask}
            onRemove={taskList.removeTask}
          />
        </div>
      )}

      {view === "timer" && (
        <div className={`flex w-full flex-col items-center ${inactivityMode ? "min-h-[72vh] justify-center" : ""}`}>
          {inactivityMode ? (
            <div className="flex flex-col items-center">
              <CircularTimer
                timeLeft={timer.timeLeft}
                progress={timer.progress}
                mode={timer.mode}
                isRunning={timer.isRunning}
              />
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Move mouse or press a key to return
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-5">
              <ModeSelector currentMode={timer.mode} onModeChange={timer.setMode} />

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

              <CircularTimer
                timeLeft={timer.timeLeft}
                progress={timer.progress}
                mode={timer.mode}
                isRunning={timer.isRunning}
              />

              <TimerControls
                isRunning={timer.isRunning}
                onStart={handleStart}
                onPause={timer.pause}
                onReset={timer.reset}
                onFocusMode={() => setFocusMode(true)}
              />

              <SessionStats
                sessionsCompleted={timer.sessionsCompleted}
                totalFocusTime={timer.totalFocusTime}
                allTimeTotalSeconds={timer.allTimeTotalSeconds}
                bestDaySeconds={timer.bestDayRecord?.totalSeconds ?? 0}
                currentSubject={timer.currentSubject}
                subjects={timer.subjects}
                subjectTimes={timer.subjectTimes}
              />

              <ExamCountdown
                exams={examCountdown.exams}
                onAdd={examCountdown.addExam}
                onRemove={examCountdown.removeExam}
              />

              <p className="text-xs text-muted-foreground/50">
                {timer.customDurations.focus}min focus • {timer.customDurations.shortBreak}min break • Data saved locally
              </p>
            </div>
          )}
        </div>
      )}

      <StudyCat visible={catVisible} onHide={() => setCatVisible(false)} isRunning={timer.isRunning} mode={timer.mode} totalFocusTime={timer.totalFocusTime} />
    </div>
  );
};

export default Index;
