import { formatEventDate } from "@/lib/date/format";
import styles from "./EventCardMeta.module.css";

interface EventCardMetaProps {
  createdBy: string;
  createdAt: string;
}

export function EventCardMeta({ createdBy, createdAt }: EventCardMetaProps) {
  return (
    <div className={styles.root}>
      <span>{createdBy}</span>
      <span className={styles.dot} aria-hidden />
      <time dateTime={createdAt}>{formatEventDate(createdAt)}</time>
    </div>
  );
}
