"use client";

import { getActivityStatus } from "@/lib/events/activity-status";
import type { TeamEvent } from "@/types/event";
import { EventCardActivityStatus } from "./EventCardActivityStatus";
import { EventCardDescription } from "./EventCardDescription";
import { EventCardMeta } from "./EventCardMeta";
import { EventCardPeople } from "./EventCardPeople";
import { EventCardStatus } from "./EventCardStatus";
import { EventCardTags } from "./EventCardTags";
import { EventCardTitle } from "./EventCardTitle";
import { getEventBorderClass } from "./get-event-border-class";
import styles from "./EventCard.module.css";

interface EventCardProps {
  event: TeamEvent;
  onClick: (event: TeamEvent) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const isActivity = event.type === "actividad";

  const open = () => onClick(event);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.root} ${getEventBorderClass(event)}`}
      onClick={open}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          open();
        }
      }}
    >
      <div className={styles.header}>
        <EventCardTitle title={event.title} />
        <EventCardStatus type={event.type} status={event.status} />
      </div>
      <EventCardMeta createdBy={event.created_by} createdAt={event.created_at} />
      <EventCardDescription description={event.description} />
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <EventCardPeople people={event.involved} />
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
