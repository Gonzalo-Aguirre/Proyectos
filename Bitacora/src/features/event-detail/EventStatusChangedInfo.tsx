import { formatEventDate } from "@/lib/date/format";
import styles from "./EventStatusChangedInfo.module.css";

interface EventStatusChangedInfoProps {
  changedBy: string;
  changedAt: string;
}

export function EventStatusChangedInfo({
  changedBy,
  changedAt,
}: EventStatusChangedInfoProps) {
  return (
    <div className={styles.root}>
      <p className={styles.label}>Último cambio</p>
      <p className={styles.copy}>
        {changedBy} · {formatEventDate(changedAt)}
      </p>
    </div>
  );
}
