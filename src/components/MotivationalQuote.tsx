import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  { text: "Study hard what interests you the most in the most undisciplined way.", author: "Richard Feynman" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

export function MotivationalQuote() {
  const quote = useMemo(() => {
    // Pick a quote based on the current date + hour so it changes each session
    const seed = new Date().getHours() + new Date().getDate();
    return QUOTES[seed % QUOTES.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-start gap-2.5 rounded-xl bg-card border border-border px-4 py-3 w-full max-w-md"
    >
      <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-foreground/90 italic leading-relaxed">"{quote.text}"</p>
        <p className="mt-1 text-[10px] text-muted-foreground">— {quote.author}</p>
      </div>
    </motion.div>
  );
}
