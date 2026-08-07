"use client";

import { useState } from "react";
import { ActivityStatusSelector } from "@/features/activity-status/ActivityStatusSelector";
import { PersonChip } from "@/features/chips/PersonChip";
import { TagPill } from "@/features/chips/TagPill";
import { EventCardMeta } from "@/features/event-card/EventCardMeta";
import { EventCardStatus } from "@/features/event-card/EventCardStatus";
import { getActivityStatus } from "@/lib/events/activity-status";
import type {
  ActivityStatus,
  ChangeStatusInput,
  TeamEvent,
} from "@/types/event";
import { EventDetailResolution } from "./EventDetailResolution";
import { EventStatusChangedInfo } from "./EventStatusChangedInfo";
import { EventStatusChangeForm } from "./EventStatusChangeForm";
import styles from "./EventDetail.module.css";

interface EventDetailProps {
  event: TeamEvent;
  onChangeStatus?: (input: ChangeStatusInput) => Promise<void>;
  onChangeActivityStatus?: (status: ActivityStatus) => Promise<void>;
}

export function EventDetail({
  event,
  onChangeStatus,
  onChangeActivityStatus,
}: EventDetailProps) {
  const isProblem = event.type === "problema";
  const isActivity = event.type === "actividad";
  const [savingActivityStatus, setSavingActivityStatus] = useState(false);

  const handleActivityStatus = async (status: ActivityStatus) => {
    if (!onChangeActivityStatus) return;
    try {
      setSavingActivityStatus(true);
      await onChangeActivityStatus(status);
    } finally {
      setSavingActivityStatus(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.activityStatusRow}>
        <div className={styles.metaRow}>
          <EventCardStatus type={event.type} status={event.status} />
          <EventCardMeta
            createdBy={event.created_by}
            createdAt={event.created_at}
          />
        </div>

        {isActivity && onChangeActivityStatus ? (
          <ActivityStatusSelector
            value={getActivityStatus(event)}
            onChange={(status) => void handleActivityStatus(status)}
            disabled={savingActivityStatus}
          />
        ) : null}
      </div>

      {isProblem && event.status_changed_by && event.status_changed_at ? (
        <EventStatusChangedInfo
          changedBy={event.status_changed_by}
          changedAt={event.status_changed_at}
        />
      ) : null}

      <div className={styles.descriptionSection}>
        <h3 className={styles.sectionTitle}>Descripción</h3>
        <p className={styles.body}>{event.description}</p>
      </div>

      {isProblem && event.resolution ? (
        <EventDetailResolution resolution={event.resolution} />
      ) : null}

      {isProblem && !event.resolution ? (
        <p className={styles.noResolution}>
          Todavía no hay solución registrada.
        </p>
      ) : null}

      {isProblem && onChangeStatus ? (
        <EventStatusChangeForm
          key={`${event.id}-${event.status}-${event.status_changed_at ?? "none"}`}
          event={event}
          onChangeStatus={onChangeStatus}
        />
      ) : null}

      <div className={styles.footerGrid}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Involucrados</h3>
          {event.involved.length > 0 ? (
            <div className={styles.chips}>
              {event.involved.map((name) => (
                <PersonChip key={name} name={name} />
              ))}
            </div>
          ) : (
            <p className={styles.muted}>Sin personas registradas.</p>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Etiquetas</h3>
          {event.tags.length > 0 ? (
            <div className={styles.chips}>
              {event.tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          ) : (
            <p className={styles.muted}>Sin etiquetas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
