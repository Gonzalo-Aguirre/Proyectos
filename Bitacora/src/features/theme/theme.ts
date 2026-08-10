export type ThemeId = "system" | "light" | "dark" | "ocean";

export const THEME_STORAGE_KEY = "bitacora-theme";

export const THEMES: {
  id: ThemeId;
  label: string;
  short: string;
  swatch: string;
}[] = [
  { id: "system", label: "Sistema", short: "Auto", swatch: "linear-gradient(135deg,#f4f7f6 50%,#0e1513 50%)" },
  { id: "light", label: "Claro", short: "Claro", swatch: "#f4f7f6" },
  { id: "dark", label: "Oscuro", short: "Oscuro", swatch: "#0e1513" },
  { id: "ocean", label: "Océano", short: "Océano", swatch: "#0b1f2a" },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return (
    value === "system" ||
    value === "light" ||
    value === "dark" ||
    value === "ocean"
  );
}
