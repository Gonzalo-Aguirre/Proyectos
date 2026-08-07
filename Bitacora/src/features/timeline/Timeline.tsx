import { EventCard } from "@/features/event-card/EventCard";
import type { TeamEvent } from "@/types/event";
import { TimelineEmpty } from "./TimelineEmpty";
import styles from "./Timeline.module.css";

interface TimelineProps {
  events: TeamEvent[];
  onSelect: (event: TeamEvent) => void;
}

export function Timeline({ events, onSelect }: TimelineProps) {
  if (events.length === 0) {
    return <TimelineEmpty />;
  }

  return (
    <div className={styles.root}>
      <div className={styles.line} aria-hidden />
      {events.map((event) => (
        <div key={event.id} className={styles.item}>
          <EventCard event={event} onClick={onSelect} />
        </div>
      ))}
    </div>
  );
}
