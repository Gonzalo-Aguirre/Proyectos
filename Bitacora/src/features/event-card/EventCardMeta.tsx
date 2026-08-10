import { formatEventDate } from "@/lib/date/format";
import styles from "./EventCardMeta.module.css";

interface EventCardMetaProps {
  createdBy: string;
  createdAt: string;
  variant?: "compact" | "expanded";
  /** En compacta se oculta la fecha para dejar espacio a la prioridad. */
  showDate?: boolean;
}

export function EventCardMeta({
  createdBy,
  createdAt,
  variant = "compact",
  showDate,
}: EventCardMetaProps) {
  const withDate = showDate ?? variant === "expanded";

  return (
    <div
      className={variant === "expanded" ? styles.expanded : styles.compact}
    >
      <span>{createdBy}</span>
      {withDate ? (
        <>
          <span className={styles.dot} aria-hidden />
          <time dateTime={createdAt}>{formatEventDate(createdAt)}</time>
        </>
      ) : null}
    </div>
  );
}
