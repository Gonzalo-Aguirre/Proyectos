import Link from "next/link";
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
}

export function AppHeader({
  environmentName,
  bitacoraTitle,
  canEditTitle = false,
  onSaveBitacoraTitle,
  showBackToEnvironments = false,
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
            <p className={styles.envName}>{environmentName}</p>
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
