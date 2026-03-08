import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getHourlyQuote } from "@/lib/motivationalQuotes";

export function MotivationalQuote() {
  const quote = useMemo(() => getHourlyQuote(new Date()), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 w-full max-w-md"
    >
      <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-foreground/90 italic leading-relaxed">"{quote.text}"</p>
        <p className="mt-1 text-[10px] text-muted-foreground">— {quote.author}</p>
      </div>
    </motion.div>
  );
}
