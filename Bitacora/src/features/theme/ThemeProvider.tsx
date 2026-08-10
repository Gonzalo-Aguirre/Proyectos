"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  isThemeId,
  THEME_STORAGE_KEY,
  type ThemeId,
} from "./theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme === "ocean"
        ? "dark"
        : theme;
  document.documentElement.style.colorScheme =
    resolved === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initial = isThemeId(stored) ? stored : "system";
    setThemeState(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (!isThemeId(current) || current === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider.");
  }
  return ctx;
}
