"use client";

import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
