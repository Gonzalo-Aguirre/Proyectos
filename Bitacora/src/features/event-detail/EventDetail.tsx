"use client";

import { useState } from "react";
import { ActivityStatusSelector } from "@/features/activity-status/ActivityStatusSelector";
import { DangerAction } from "@/features/workspace/DangerAction";
import { getActivityStatus } from "@/lib/events/activity-status";
import type {
  ActivityStatus,
  ChangeStatusInput,
  EventItem,
  EventPriority,
  TeamEvent,
} from "@/types/event";
import { EventRelationPanel } from "./ActivityRelationField";
import { EventFollowUpSection } from "./EventFollowUpSection";
import { EventMetaEditor } from "./EventMetaEditor";
import { EventStatusChangeForm } from "./EventStatusChangeForm";
import { EventTextEditor } from "./EventTextEditor";
import { PrioritySelector } from "./PrioritySelector";
import styles from "./EventDetail.module.css";

interface EventDetailProps {
  event: TeamEvent;
  items?: EventItem[];
  activities?: TeamEvent[];
  relatedActivity?: TeamEvent | null;
  relatedRetos?: TeamEvent[];
  onChangeStatus?: (input: ChangeStatusInput) => Promise<void>;
  onChangeActivityStatus?: (status: ActivityStatus) => Promise<void>;
  onChangePriority?: (priority: EventPriority) => Promise<void>;
  onUpdateTexts?: (input: {
    title: string;
    description: string;
  }) => Promise<void>;
  onUpdateMeta?: (input: {
    involved: string[];
    tags: string[];
  }) => Promise<void>;
  onUpdateRelation?: (relatedActivityId: string | null) => Promise<void>;
  onOpenRelated?: (event: TeamEvent) => void;
  onAddItem?: (body: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

/** Panel de edición: solo acciones para sumar/cambiar. La lectura va a la vista completa. */
export function EventDetail({
  event,
  items = [],
  activities = [],
  relatedActivity = null,
  relatedRetos = [],
  onChangeStatus,
  onChangeActivityStatus,
  onChangePriority,
  onUpdateTexts,
  onUpdateMeta,
  onUpdateRelation,
  onOpenRelated,
  onAddItem,
  onDelete,
}: EventDetailProps) {
  const isReto = event.type === "reto";
  const isActivity = event.type === "actividad";
  const [savingActivityStatus, setSavingActivityStatus] = useState(false);
  const [savingPriority, setSavingPriority] = useState(false);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  const handleActivityStatus = async (status: ActivityStatus) => {
    if (!onChangeActivityStatus) return;
    try {
      setSavingActivityStatus(true);
      await onChangeActivityStatus(status);
    } finally {
      setSavingActivityStatus(false);
    }
  };

  const handlePriority = async (priority: EventPriority) => {
    if (!onChangePriority) return;
    try {
      setSavingPriority(true);
      setPriorityError(null);
      await onChangePriority(priority);
    } catch (err) {
      setPriorityError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la prioridad. Si usás Supabase, corré migration_event_priority.sql.",
      );
    } finally {
      setSavingPriority(false);
    }
  };

  return (
    <div className={styles.root}>
      <p className={styles.panelHint}>
        Este panel suma o modifica. El contenido se ve en la tarjeta del centro.
      </p>

      {onUpdateTexts ? (
        <EventTextEditor
          title={event.title}
          description={event.description}
          onSave={onUpdateTexts}
        />
      ) : null}

      {onChangePriority ? (
        <>
          <PrioritySelector
            value={event.priority ?? "media"}
            onChange={(priority) => void handlePriority(priority)}
            disabled={savingPriority}
          />
          {priorityError ? (
            <p className={styles.panelError}>{priorityError}</p>
          ) : null}
        </>
      ) : null}

      {isActivity && onChangeActivityStatus ? (
        <div className={styles.activityStatusRow}>
          <span className={styles.sectionTitle}>Estado de la actividad</span>
          <ActivityStatusSelector
            value={getActivityStatus(event)}
            onChange={(status) => void handleActivityStatus(status)}
            disabled={savingActivityStatus}
          />
        </div>
      ) : null}

      <EventRelationPanel
        event={event}
        activities={activities}
        relatedActivity={relatedActivity}
        relatedRetos={relatedRetos}
        mode="edit"
        onSaveRelation={onUpdateRelation}
        onOpenRelated={onOpenRelated}
      />

      <EventFollowUpSection
        mode="composer"
        items={items}
        onAddItem={onAddItem}
      />

      {isReto && onChangeStatus ? (
        <EventStatusChangeForm
          key={`${event.id}-${event.status}-${event.status_changed_at ?? "none"}`}
          event={event}
          onChangeStatus={onChangeStatus}
        />
      ) : null}

      <EventMetaEditor
        involved={event.involved}
        tags={event.tags}
        onSave={onUpdateMeta}
      />

      {onDelete ? (
        <DangerAction
          label="Eliminar tarjeta"
          hint="Borra esta actividad/reto y su seguimiento."
          onConfirm={onDelete}
        />
      ) : null}
    </div>
  );
}
