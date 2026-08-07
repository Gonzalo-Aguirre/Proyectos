import { daysSince, formatRelativeDays } from "@/lib/date/format";
import type { TeamEvent } from "@/types/event";
import styles from "./LastActivityIndicator.module.css";

interface LastActivityIndicatorProps {
  events: TeamEvent[];
}

export function LastActivityIndicator({ events }: LastActivityIndicatorProps) {
  if (events.length === 0) {
    return (
      <div className={styles.root}>
        <span className={styles.dotStale} aria-hidden />
        <span>Sin novedades registradas</span>
      </div>
    );
  }

  const latest = events[0];
  const stale = daysSince(latest.created_at) >= 3;

  return (
    <div className={styles.root}>
      <span className={stale ? styles.dotStale : styles.dotFresh} aria-hidden />
      <span>
        {stale
          ? `Sin novedades ${formatRelativeDays(latest.created_at)}`
          : `Última actividad ${formatRelativeDays(latest.created_at)}`}
      </span>
    </div>
  );
}
