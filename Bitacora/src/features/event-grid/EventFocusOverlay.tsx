"use client";

import { useEffect } from "react";
import { EventCard } from "@/features/event-card/EventCard";
import type { EventItem, TeamEvent } from "@/types/event";
import styles from "./EventFocusOverlay.module.css";

interface EventFocusOverlayProps {
  event: TeamEvent;
  lastUpdatedAt?: string | null;
  items?: EventItem[];
  itemsLoading?: boolean;
  relatedActivity?: TeamEvent | null;
  relatedRetos?: TeamEvent[];
  onOpenRelated?: (event: TeamEvent) => void;
  onClose: () => void;
}

export function EventFocusOverlay({
  event,
  lastUpdatedAt = null,
  items = [],
  itemsLoading = false,
  relatedActivity = null,
  relatedRetos = [],
  onOpenRelated,
  onClose,
}: EventFocusOverlayProps) {
  useEffect(() => {
    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.root} role="presentation">
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cerrar vista ampliada"
        onClick={onClose}
      />
      <div className={styles.stage} role="dialog" aria-label={event.title}>
        <EventCard
          event={event}
          variant="expanded"
          lastUpdatedAt={lastUpdatedAt}
          items={items}
          itemsLoading={itemsLoading}
          relatedActivity={relatedActivity}
          relatedRetos={relatedRetos}
          onOpenRelated={onOpenRelated}
        />
      </div>
    </div>
  );
}
