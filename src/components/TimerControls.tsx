import { Play, Pause, RotateCcw, Maximize2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onFocusMode?: () => void;
  onFinish?: () => void;
  showFinish?: boolean;
}

export function TimerControls({ isRunning, onStart, onPause, onReset, onFocusMode, onFinish, showFinish }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="h-12 w-12 rounded-full border-muted-foreground/20 bg-secondary hover:bg-secondary/80"
      >
        <RotateCcw className="h-5 w-5 text-muted-foreground" />
      </Button>

      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={isRunning ? onPause : onStart}
          className="h-16 w-16 rounded-full text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50"
          size="icon"
        >
          {isRunning ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
        </Button>
        {showFinish && onFinish && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFinish}
            className="h-7 rounded-full px-3 text-[10px] border-primary/30 text-primary hover:bg-primary/10"
          >
            <Square className="mr-1 h-3 w-3" /> Finish Session
          </Button>
        )}
      </div>

      {onFocusMode ? (
        <Button
          variant="outline"
          size="icon"
          onClick={onFocusMode}
          className="h-12 w-12 rounded-full border-muted-foreground/20 bg-secondary hover:bg-secondary/80"
          title="Focus mode"
        >
          <Maximize2 className="h-5 w-5 text-muted-foreground" />
        </Button>
      ) : (
        <div className="h-12 w-12" />
      )}
    </div>
  );
}
