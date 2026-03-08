import { useEffect, useState } from "react";

export type ColorTheme = "emerald" | "ocean" | "sunset" | "violet" | "rose" | "amber";

const THEME_KEY = "studyflow_theme";
const COLOR_KEY = "studyflow_color";
const THEME_CLASSES: ColorTheme[] = ["emerald", "ocean", "sunset", "violet", "rose", "amber"];

export const COLOR_THEMES: Record<ColorTheme, { label: string; preview: string }> = {
  emerald: { label: "Emerald", preview: "hsl(150 70% 40%)" },
  ocean: { label: "Ocean", preview: "hsl(210 70% 45%)" },
  sunset: { label: "Sunset", preview: "hsl(15 75% 48%)" },
  violet: { label: "Violet", preview: "hsl(270 60% 50%)" },
  rose: { label: "Rose", preview: "hsl(340 65% 47%)" },
  amber: { label: "Amber", preview: "hsl(40 80% 45%)" },
};

const THEME_VALUES: Record<
  ColorTheme,
  {
    light: { primary: string; primaryForeground: string };
    dark: { primary: string; primaryForeground: string };
  }
> = {
  emerald: {
    light: { primary: "150 70% 40%", primaryForeground: "0 0% 100%" },
    dark: { primary: "150 80% 55%", primaryForeground: "230 25% 7%" },
  },
  ocean: {
    light: { primary: "210 70% 45%", primaryForeground: "0 0% 100%" },
    dark: { primary: "210 80% 60%", primaryForeground: "230 25% 7%" },
  },
  sunset: {
    light: { primary: "15 75% 48%", primaryForeground: "0 0% 100%" },
    dark: { primary: "15 85% 58%", primaryForeground: "230 25% 7%" },
  },
  violet: {
    light: { primary: "270 60% 50%", primaryForeground: "0 0% 100%" },
    dark: { primary: "270 70% 65%", primaryForeground: "230 25% 7%" },
  },
  rose: {
    light: { primary: "340 65% 47%", primaryForeground: "0 0% 100%" },
    dark: { primary: "340 75% 60%", primaryForeground: "230 25% 7%" },
  },
  amber: {
    light: { primary: "40 80% 45%", primaryForeground: "0 0% 100%" },
    dark: { primary: "40 90% 55%", primaryForeground: "230 25% 7%" },
  },
};

function getInitialDark() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === "dark";
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

function getInitialColor(): ColorTheme {
  try {
    const stored = localStorage.getItem(COLOR_KEY);
    if (stored && stored in COLOR_THEMES) return stored as ColorTheme;
  } catch {}
  return "emerald";
}

export function useThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialDark);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(getInitialColor);

  useEffect(() => {
    const root = document.documentElement;
    const palette = THEME_VALUES[colorTheme][isDark ? "dark" : "light"];

    root.classList.toggle("dark", isDark);
    THEME_CLASSES.forEach((theme) => root.classList.remove(`theme-${theme}`));
    root.classList.add(`theme-${colorTheme}`);

    root.style.colorScheme = isDark ? "dark" : "light";

    // Inline fallback to guarantee updates even if stylesheet cache lags.
    root.style.setProperty("--primary", palette.primary);
    root.style.setProperty("--primary-foreground", palette.primaryForeground);
    root.style.setProperty("--ring", palette.primary);
    root.style.setProperty("--timer-glow", palette.primary);
    root.style.setProperty("--sidebar-primary", palette.primary);
    root.style.setProperty("--sidebar-ring", palette.primary);

    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
      localStorage.setItem(COLOR_KEY, colorTheme);
    } catch {}
  }, [isDark, colorTheme]);

  return {
    isDark,
    toggle: () => setIsDark((prev) => !prev),
    colorTheme,
    setColor: setColorTheme,
  };
}
