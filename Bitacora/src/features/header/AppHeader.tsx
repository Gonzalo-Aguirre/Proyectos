import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeSelector } from "@/features/theme/ThemeSelector";
import { AppSubtitle } from "./AppSubtitle";
import { AppTitle } from "./AppTitle";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  environmentName?: string;
  bitacoraTitle?: string;
  canEditTitle?: boolean;
  onSaveBitacoraTitle?: (title: string) => Promise<void> | void;
  showBackToEnvironments?: boolean;
  /** Acciones junto al nombre del entorno (ej. botón Reporte). */
  environmentActions?: ReactNode;
}

export function AppHeader({
  environmentName,
  bitacoraTitle,
  canEditTitle = false,
  onSaveBitacoraTitle,
  showBackToEnvironments = false,
  environmentActions,
}: AppHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.topRow}>
        <div className={styles.copy}>
          <AppTitle
            title={bitacoraTitle}
            editable={canEditTitle}
            onSave={onSaveBitacoraTitle}
          />
          {environmentName ? (
            <div className={styles.envRow}>
              <p className={styles.envName}>{environmentName}</p>
              {environmentActions}
            </div>
          ) : (
            <AppSubtitle />
          )}
        </div>
        <div className={styles.actions}>
          <ThemeSelector />
          {showBackToEnvironments ? (
            <Link href="/entornos" className={styles.backLink}>
              Entornos
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
