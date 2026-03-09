import { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, BarChart3, ListTodo, FileText, CalendarDays } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useTaskList } from "@/hooks/useTaskList";
import { useInactivityMode } from "@/hooks/useInactivityMode";
import { useGamification } from "@/hooks/useGamification";
import { useExamCountdown } from "@/hooks/useExamCountdown";
import { useReminders } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
import { fireSessionComplete, fireLevelUp, fireBadgeUnlock } from "@/lib/celebrations";
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
import { StudyStyleSelector } from "@/components/StudyStyleSelector";
import { CosmeticsShop } from "@/components/CosmeticsShop";
import { CsvExportImport } from "@/components/CsvExportImport";
import { SkiingCatGame } from "@/components/SkiingCatGame";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logoUrl from "@/assets/logo.png";

type View = "timer" | "analytics" | "tasks" | "report" | "schedule";

const Index = () => {
  // Build marker to ensure Publish detects a real bundle change
  const buildId = "2026-03-09-03";

  const timer = useStudyTimer();
  const { isDark, toggle: toggleTheme, colorTheme, setColor } = useThemeToggle();
  const taskList = useTaskList();
  const gamification = useGamification();
  const examCountdown = useExamCountdown();
  const [view, setView] = useState<View>("timer");
  const [focusMode, setFocusMode] = useState(false);
  const [catVisible, setCatVisible] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  useReminders({ isRunning: timer.isRunning });

  const pendingForCurrent = taskList.pendingCount(timer.currentSubject);
  const inactivityMode = useInactivityMode({
    timeoutMs: 20_000,
    enabled: view === "timer" && timer.isRunning,
  });
  const hideChrome = view === "timer" && inactivityMode;

  const prevLevelRef = useRef(gamification.level);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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

      setShowRating(true);
    };

    const breakCompleteHandler = () => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Break's over!", {
          body: "Time to start your next focus session.",
        });
      }
      toast({ title: "Break's over!", description: "Time to start your next focus session." });
    };

    window.addEventListener("studyflow:session-complete", handler);
    window.addEventListener("studyflow:break-complete", breakCompleteHandler);
    return () => {
      window.removeEventListener("studyflow:session-complete", handler);
      window.removeEventListener("studyflow:break-complete", breakCompleteHandler);
    };
  }, [gamification]);

  const handleStart = () => {
    timer.start();
  };

  // Fullscreen focus mode
  if (focusMode) {
    return (
      <div
        data-build={buildId}
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
            studyStyle={timer.studyStyle}
            currentFocusDurationMinutes={timer.currentFocusDurationMinutes}
            lastFocusScore={timer.lastFocusScore}
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
    <div data-build={buildId} className="flex min-h-screen flex-col items-center bg-background px-4 py-6 selection:bg-primary/30">
      {!hideChrome && (
        <header className="mb-6 flex w-full max-w-md flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden cursor-pointer" onClick={() => setView("timer")}>
                <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
              </div>
              <h1 
                className="truncate text-xl font-bold tracking-tight text-foreground select-none"
                onClick={() => setLogoClicks(c => c >= 20 ? 0 : c + 1)}
              >
                {logoClicks >= 10 && logoClicks < 20 ? "🍅" : <>Pomi<span className="text-primary">dor</span></>}
              </h1>
            </div>

            <div className="flex items-center gap-0.5">
              <GamificationBar
                xp={gamification.xp}
                level={gamification.level}
                levelProgress={gamification.levelProgress}
                xpInCurrentLevel={gamification.xpInCurrentLevel}
                xpNeededForNext={gamification.xpNeededForNext}
                currentStreak={gamification.currentStreak}
                longestStreak={gamification.longestStreak}
                totalSessions={gamification.totalSessions}
                unlockedBadges={gamification.unlockedBadges}
                lockedBadges={gamification.lockedBadges}
                newBadges={gamification.newBadges}
                onClearNewBadges={gamification.clearNewBadges}
              />
              <CosmeticsShop />
              <AmbientMusic />
              <SettingsPanel
                durations={timer.customDurations}
                onDurationsChange={timer.setCustomDurations}
                colorTheme={colorTheme}
                onColorChange={setColor}
                disabled={false}
                catVisible={catVisible}
                onCatToggle={setCatVisible}
                dailyGoal={timer.dailyGoal}
                onDailyGoalChange={timer.setDailyGoal}
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
              />
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 rounded-full bg-secondary/70 p-1">
            {[
              { key: "analytics" as View, icon: BarChart3, label: "Analytics" },
              { key: "report" as View, icon: FileText, label: "Report" },
              { key: "schedule" as View, icon: CalendarDays, label: "Schedule" },
            ].map(({ key, icon: Icon, label }) => {
              const isActive = view === key;
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setView((v) => (v === key ? "timer" : key))}
                  className={`h-8 rounded-full px-3 text-xs ${isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {label}
                </Button>
              );
            })}
          </div>
        </header>
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


      {view === "timer" && (
        <div className={`flex w-full flex-col items-center ${inactivityMode ? "min-h-[72vh] justify-center" : ""}`}>
          {inactivityMode ? (
            <div className="flex flex-col items-center">
              <CircularTimer
                timeLeft={timer.timeLeft}
                progress={timer.progress}
                mode={timer.mode}
                isRunning={timer.isRunning}
                studyStyle={timer.studyStyle}
                currentFocusDurationMinutes={timer.currentFocusDurationMinutes}
                lastFocusScore={timer.lastFocusScore}
              />
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Move mouse or press a key to return
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <StudyStyleSelector
                currentStyle={timer.studyStyle}
                onStyleChange={timer.setStudyStyle}
              />

              <ModeSelector
                currentMode={timer.mode}
                onModeChange={timer.setMode}
                disableBreakModes={timer.studyStyle === "freeStudy"}
              />

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
                studyStyle={timer.studyStyle}
                currentFocusDurationMinutes={timer.currentFocusDurationMinutes}
                lastFocusScore={timer.lastFocusScore}
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
                currentStreak={gamification.currentStreak}
                dailyGoal={timer.dailyGoal}
                onTodayClick={() => setIsSettingsOpen(true)}
              />

              <ExamCountdown
                exams={examCountdown.exams}
                onAdd={examCountdown.addExam}
                onRemove={examCountdown.removeExam}
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
        </div>
      )}

      <StudyCat visible={catVisible} onHide={() => setCatVisible(false)} isRunning={timer.isRunning} mode={timer.mode} totalFocusTime={timer.totalFocusTime} />
      
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Complete!</DialogTitle>
            <DialogDescription>How was your focus during this session?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-24 hover:bg-destructive/10 hover:text-destructive border-border" onClick={() => setShowRating(false)}>
              <span className="text-3xl leading-none">😫</span>
              <span className="text-xs font-medium">Distracted</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-24 hover:bg-primary/10 hover:text-primary border-border" onClick={() => setShowRating(false)}>
              <span className="text-3xl leading-none">🙂</span>
              <span className="text-xs font-medium">Good</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center gap-2 h-24 border-primary text-primary hover:bg-primary/10 shadow-sm" onClick={() => {
              setShowRating(false);
              timer.setMode("focus");
              setTimeout(() => timer.start(), 100);
            }}>
              <span className="text-3xl leading-none">🔥</span>
              <span className="text-xs font-bold">Flow</span>
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-1">Selecting "Flow" skips your break and starts a new focus session immediately.</p>
        </DialogContent>
      </Dialog>
      
      {!hideChrome && (
        <footer className="mt-auto pt-10 pb-4 text-center text-xs text-muted-foreground/60 w-full max-w-md">
          <p>Cultivating focus, one session at a time.</p>
          <p className="mt-1">Pomidor &copy; {new Date().getFullYear()}</p>
        </footer>
      )}
    </div>
  );
};

export default Index;
