import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({ isRunning, onStart, onPause, onReset }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="h-12 w-12 rounded-full border-muted-foreground/20 bg-secondary hover:bg-secondary/80"
        >
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={isRunning ? onPause : onStart}
          className="h-16 w-16 rounded-full text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50"
          size="icon"
        >
          {isRunning ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-1" />
          )}
        </Button>
      </motion.div>

      {/* Spacer to center the play button */}
      <div className="h-12 w-12" />
    </div>
  );
}
