import { StudyStyle } from "@/hooks/useStudyTimer";
import { Button } from "@/components/ui/button";

interface StudyStyleSelectorProps {
  currentStyle: StudyStyle;
  onStyleChange: (style: StudyStyle) => void;
}

const styles: { key: StudyStyle; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "progressive", label: "Progressive" },
  { key: "freeStudy", label: "Free Study" },
];

export function StudyStyleSelector({ currentStyle, onStyleChange }: StudyStyleSelectorProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center gap-1 rounded-full bg-secondary/70 p-1">
        {styles.map((style) => {
          const active = currentStyle === style.key;
          return (
            <Button
              key={style.key}
              type="button"
              size="sm"
              variant="ghost"
              className={active ? "rounded-full bg-background text-foreground shadow-sm" : "rounded-full text-muted-foreground hover:text-foreground"}
              onClick={() => onStyleChange(style.key)}
            >
              {style.label}
            </Button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        {currentStyle === "classic" && "25/5 flow with long break every 4 sessions."}
        {currentStyle === "progressive" && "Focus sessions grow by 5 min each round (up to 60 min)."}
        {currentStyle === "freeStudy" && "Open-ended stopwatch mode with no forced breaks."}
      </p>
    </div>
  );
}
