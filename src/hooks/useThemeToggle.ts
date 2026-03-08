import { useState, useEffect } from "react";

export type ColorTheme = "emerald" | "ocean" | "sunset" | "violet" | "rose" | "amber";

const THEME_KEY = "studyflow_theme";
const COLOR_KEY = "studyflow_color";

interface ThemeColors {
  light: { primary: string; ring: string; timerGlow: string };
  dark: { primary: string; ring: string; timerGlow: string };
}

export const COLOR_THEMES: Record<ColorTheme, { label: string; preview: string; colors: ThemeColors }> = {
  emerald: {
    label: "Emerald",
    preview: "hsl(150, 70%, 40%)",
    colors: {
      light: { primary: "150 70% 40%", ring: "150 70% 40%", timerGlow: "150 80% 55%" },
      dark: { primary: "150 80% 55%", ring: "150 80% 55%", timerGlow: "150 80% 55%" },
    },
  },
  ocean: {
    label: "Ocean",
    preview: "hsl(210, 80%, 55%)",
    colors: {
      light: { primary: "210 70% 45%", ring: "210 70% 45%", timerGlow: "210 80% 55%" },
      dark: { primary: "210 80% 60%", ring: "210 80% 60%", timerGlow: "210 80% 60%" },
    },
  },
  sunset: {
    label: "Sunset",
    preview: "hsl(15, 85%, 55%)",
    colors: {
      light: { primary: "15 75% 48%", ring: "15 75% 48%", timerGlow: "15 85% 55%" },
      dark: { primary: "15 85% 58%", ring: "15 85% 58%", timerGlow: "15 85% 58%" },
    },
  },
  violet: {
    label: "Violet",
    preview: "hsl(270, 70%, 55%)",
    colors: {
      light: { primary: "270 60% 50%", ring: "270 60% 50%", timerGlow: "270 70% 55%" },
      dark: { primary: "270 70% 65%", ring: "270 70% 65%", timerGlow: "270 70% 65%" },
    },
  },
  rose: {
    label: "Rose",
    preview: "hsl(340, 75%, 55%)",
    colors: {
      light: { primary: "340 65% 47%", ring: "340 65% 47%", timerGlow: "340 75% 55%" },
      dark: { primary: "340 75% 60%", ring: "340 75% 60%", timerGlow: "340 75% 60%" },
    },
  },
  amber: {
    label: "Amber",
    preview: "hsl(40, 90%, 50%)",
    colors: {
      light: { primary: "40 80% 45%", ring: "40 80% 45%", timerGlow: "40 90% 50%" },
      dark: { primary: "40 90% 55%", ring: "40 90% 55%", timerGlow: "40 90% 55%" },
    },
  },
};

function applyColorTheme(colorTheme: ColorTheme, isDark: boolean) {
  const root = document.documentElement;
  const colors = COLOR_THEMES[colorTheme].colors[isDark ? "dark" : "light"];
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--timer-glow", colors.timerGlow);
}

export function useThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) return stored === "dark";
    } catch {}
    return true;
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    try {
      const stored = localStorage.getItem(COLOR_KEY);
      if (stored && stored in COLOR_THEMES) return stored as ColorTheme;
    } catch {}
    return "emerald";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    applyColorTheme(colorTheme, isDark);
  }, [isDark, colorTheme]);

  const toggle = () => setIsDark((prev) => !prev);

  const setColor = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem(COLOR_KEY, theme);
  };

  return { isDark, toggle, colorTheme, setColor };
}
