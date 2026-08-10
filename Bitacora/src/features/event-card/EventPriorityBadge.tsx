import type { EventPriority } from "@/types/event";
import { EVENT_PRIORITY_OPTIONS } from "@/types/event";
import styles from "./EventPriorityBadge.module.css";

interface EventPriorityBadgeProps {
  priority: EventPriority;
}

export function EventPriorityBadge({ priority }: EventPriorityBadgeProps) {
  const label =
    EVENT_PRIORITY_OPTIONS.find((option) => option.id === priority)?.label ??
    priority;

  return (
    <span className={`${styles.root} ${styles[priority]}`} title={`Prioridad ${label}`}>
      {label}
    </span>
  );
}
