import Link from "next/link";
import { AppSubtitle } from "./AppSubtitle";
import { AppTitle } from "./AppTitle";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  environmentName?: string;
  showBackToEnvironments?: boolean;
}

export function AppHeader({
  environmentName,
  showBackToEnvironments = false,
}: AppHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.topRow}>
        <div className={styles.copy}>
          <AppTitle />
          {environmentName ? (
            <p className={styles.envName}>{environmentName}</p>
          ) : (
            <AppSubtitle />
          )}
        </div>
        {showBackToEnvironments ? (
          <Link href="/entornos" className={styles.backLink}>
            Entornos
          </Link>
        ) : null}
      </div>
    </header>
  );
}
