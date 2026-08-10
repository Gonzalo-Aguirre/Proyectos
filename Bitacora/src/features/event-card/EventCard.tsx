"use client";

import { getActivityStatus } from "@/lib/events/activity-status";
import { formatEventDate } from "@/lib/date/format";
import { EventRelationPanel } from "@/features/event-detail/ActivityRelationField";
import { EventDetailResolution } from "@/features/event-detail/EventDetailResolution";
import { EventFollowUpSection } from "@/features/event-detail/EventFollowUpSection";
import { EventStatusChangedInfo } from "@/features/event-detail/EventStatusChangedInfo";
import type { EventItem, TeamEvent } from "@/types/event";
import { EventCardActivityStatus } from "./EventCardActivityStatus";
import { EventCardDescription } from "./EventCardDescription";
import { EventCardMeta } from "./EventCardMeta";
import { EventCardPeople } from "./EventCardPeople";
import { EventCardStatus } from "./EventCardStatus";
import { EventCardTags } from "./EventCardTags";
import { EventCardTitle } from "./EventCardTitle";
import { EventPriorityBadge } from "./EventPriorityBadge";
import { getEventBorderClass } from "./get-event-border-class";
import styles from "./EventCard.module.css";

interface EventCardProps {
  event: TeamEvent;
  onClick?: (event: TeamEvent) => void;
  /** compact = grilla; expanded = vista completa */
  variant?: "compact" | "expanded";
  selected?: boolean;
  lastUpdatedAt?: string | null;
  /** Solo vista completa */
  items?: EventItem[];
  itemsLoading?: boolean;
  relatedActivity?: TeamEvent | null;
  relatedRetos?: TeamEvent[];
  onOpenRelated?: (event: TeamEvent) => void;
}

export function EventCard({
  event,
  onClick,
  variant = "compact",
  selected = false,
  lastUpdatedAt = null,
  items = [],
  itemsLoading = false,
  relatedActivity = null,
  relatedRetos = [],
  onOpenRelated,
}: EventCardProps) {
  const isActivity = event.type === "actividad";
  const isReto = event.type === "reto";
  const isExpanded = variant === "expanded";
  const updatedAt = lastUpdatedAt ?? event.created_at;

  const open = () => onClick?.(event);
  const interactive = Boolean(onClick);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={[
        styles.root,
        isExpanded ? styles.expanded : styles.compact,
        getEventBorderClass(event),
        selected ? styles.selected : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={interactive ? open : undefined}
      onKeyDown={
        interactive
          ? (keyboardEvent) => {
              if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                keyboardEvent.preventDefault();
                open();
              }
            }
          : undefined
      }
    >
      {isExpanded ? (
        <>
          <div className={styles.header}>
            <EventCardTitle title={event.title} variant={variant} />
            <div className={styles.badges}>
              <EventCardStatus type={event.type} status={event.status} />
              <EventPriorityBadge priority={event.priority} />
            </div>
          </div>

          <EventCardMeta
            createdBy={event.created_by}
            createdAt={event.created_at}
            variant={variant}
            showDate
          />

          <p className={styles.updated}>
            Última actualización{" "}
            <time dateTime={updatedAt}>{formatEventDate(updatedAt)}</time>
          </p>
        </>
      ) : (
        <div className={styles.compactHead}>
          <div className={styles.headerRow}>
            <EventCardTitle title={event.title} variant="compact" />
            <EventCardStatus type={event.type} status={event.status} />
          </div>
          <div className={styles.headerRow}>
            <span className={styles.author}>{event.created_by}</span>
            <EventPriorityBadge priority={event.priority} />
          </div>
          <p className={styles.updated}>
            Última actualización{" "}
            <time dateTime={updatedAt}>{formatEventDate(updatedAt)}</time>
          </p>
        </div>
      )}

      {isExpanded &&
      isReto &&
      event.status_changed_by &&
      event.status_changed_at ? (
        <EventStatusChangedInfo
          changedBy={event.status_changed_by}
          changedAt={event.status_changed_at}
        />
      ) : null}

      <EventCardDescription
        description={event.description}
        clamp={isExpanded ? undefined : 2}
        showLabel
        variant={variant}
      />

      {isExpanded ? (
        <div
          onClick={(eventClick) => eventClick.stopPropagation()}
          onKeyDown={(eventKey) => eventKey.stopPropagation()}
        >
          <EventRelationPanel
            event={event}
            activities={[]}
            relatedActivity={relatedActivity}
            relatedRetos={relatedRetos}
            mode="display"
            onOpenRelated={onOpenRelated}
          />
        </div>
      ) : null}

      {isExpanded ? (
        <EventFollowUpSection
          mode="display"
          items={items}
          loading={itemsLoading}
        />
      ) : null}

      {isExpanded && event.resolution ? (
        <EventDetailResolution resolution={event.resolution} />
      ) : null}

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {isExpanded ? <EventCardPeople people={event.involved} /> : null}
          <EventCardTags tags={event.tags} />
        </div>
        {isActivity ? (
          <div className={styles.footerRight}>
            <EventCardActivityStatus status={getActivityStatus(event)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
