"use client";

import { THEMES, type ThemeId } from "./theme";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeSelector.module.css";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={styles.root}
      role="group"
      aria-label="Tema de la interfaz"
    >
      {THEMES.map((item) => {
        const selected = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.option} ${selected ? styles.selected : ""}`}
            title={item.label}
            aria-label={item.label}
            aria-pressed={selected}
            onClick={() => setTheme(item.id as ThemeId)}
          >
            <span
              className={styles.swatch}
              style={{ background: item.swatch }}
              aria-hidden
            />
            <span className={styles.label}>{item.short}</span>
          </button>
        );
      })}
    </div>
  );
}
