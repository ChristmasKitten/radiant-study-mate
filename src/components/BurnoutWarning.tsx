import { AlertTriangle, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BurnoutWarningProps {
  warnings: { type: string; message: string; suggestion: string }[];
  onDismiss: () => void;
}

export function BurnoutWarning({ warnings, onDismiss }: BurnoutWarningProps) {
  if (warnings.length === 0) return null;

  // Show the most relevant warning (first one)
  const warning = warnings[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="w-full"
      >
        <div className="relative flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm">
          <div className="mt-0.5 flex-shrink-0">
            <Heart className="h-4 w-4 text-orange-500" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{warning.message}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">{warning.suggestion}</p>
          </div>
          <button
            onClick={onDismiss}
            className="mt-0.5 flex-shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
