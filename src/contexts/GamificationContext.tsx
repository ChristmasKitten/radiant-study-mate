import { createContext, useContext, ReactNode } from "react";
import { useGamification } from "@/hooks/useGamification";

type GamificationReturn = ReturnType<typeof useGamification>;

const GamificationContext = createContext<GamificationReturn | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const gamification = useGamification();
  return (
    <GamificationContext.Provider value={gamification}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext(): GamificationReturn {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamificationContext must be used within GamificationProvider");
  return ctx;
}
