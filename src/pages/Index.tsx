import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { CircularTimer } from "@/components/CircularTimer";
import { TimerControls } from "@/components/TimerControls";
import { ModeSelector } from "@/components/ModeSelector";
import { SessionStats } from "@/components/SessionStats";
import { SubjectSelector } from "@/components/SubjectSelector";

const Index = () => {
  const timer = useStudyTimer();

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8 selection:bg-primary/30">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Study<span className="text-primary">Flow</span>
        </h1>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <ModeSelector currentMode={timer.mode} onModeChange={timer.setMode} />
      </motion.div>

      {/* Subject Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <SubjectSelector
          subjects={timer.subjects}
          currentSubject={timer.currentSubject}
          onSelect={timer.setCurrentSubject}
          onAdd={timer.addSubject}
          onRemove={timer.removeSubject}
          disabled={timer.isRunning}
        />
      </motion.div>

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
        className="mb-8"
      >
        <CircularTimer
          timeLeft={timer.timeLeft}
          progress={timer.progress}
          mode={timer.mode}
          isRunning={timer.isRunning}
        />
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <TimerControls
          isRunning={timer.isRunning}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md"
      >
        <SessionStats
          sessionsCompleted={timer.sessionsCompleted}
          totalFocusTime={timer.totalFocusTime}
          allTimeTotalSeconds={timer.allTimeTotalSeconds}
          subjectTimes={timer.subjectTimes}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-xs text-muted-foreground/50"
      >
        4 focus sessions → long break • Data saved locally
      </motion.p>
    </div>
  );
};

export default Index;
