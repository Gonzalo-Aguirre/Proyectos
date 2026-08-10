"use client";

import { EventCard } from "@/features/event-card/EventCard";
import type { TeamEvent } from "@/types/event";
import { TimelineEmpty } from "@/features/timeline/TimelineEmpty";
import styles from "./EventGrid.module.css";

interface EventGridProps {
  events: TeamEvent[];
  selectedId?: string | null;
  lastUpdateById?: Map<string, string>;
  onSelect: (event: TeamEvent) => void;
}

export function EventGrid({
  events,
  selectedId = null,
  lastUpdateById,
  onSelect,
}: EventGridProps) {
  if (events.length === 0) {
    return <TimelineEmpty />;
  }

  return (
    <div className={styles.root} role="list" aria-label="Eventos del entorno">
      {events.map((event) => (
        <div key={event.id} className={styles.cell} role="listitem">
          <EventCard
            event={event}
            variant="compact"
            selected={event.id === selectedId}
            lastUpdatedAt={lastUpdateById?.get(event.id) ?? null}
            onClick={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
