import { useState, useEffect } from "react";

export type ColorTheme = "emerald" | "ocean" | "sunset" | "violet" | "rose" | "amber";

const THEME_KEY = "studyflow_theme";
const COLOR_KEY = "studyflow_color";

export const COLOR_THEMES: Record<ColorTheme, { label: string; preview: string }> = {
  emerald: { label: "Emerald", preview: "hsl(150, 70%, 40%)" },
  ocean: { label: "Ocean", preview: "hsl(210, 80%, 55%)" },
  sunset: { label: "Sunset", preview: "hsl(15, 85%, 55%)" },
  violet: { label: "Violet", preview: "hsl(270, 70%, 55%)" },
  rose: { label: "Rose", preview: "hsl(340, 75%, 55%)" },
  amber: { label: "Amber", preview: "hsl(40, 90%, 50%)" },
};

const ALL_THEME_CLASSES = ["theme-ocean", "theme-sunset", "theme-violet", "theme-rose", "theme-amber"];

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

    // Remove all theme classes, then add current one (emerald = default, no class needed)
    ALL_THEME_CLASSES.forEach((cls) => root.classList.remove(cls));
    if (colorTheme !== "emerald") {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, [isDark, colorTheme]);

  const toggle = () => setIsDark((prev) => !prev);

  const setColor = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem(COLOR_KEY, theme);
  };

  return { isDark, toggle, colorTheme, setColor };
}
