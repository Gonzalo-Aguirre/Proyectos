"use client";

import { useState } from "react";
import { ActivityStatusSelector } from "@/features/activity-status/ActivityStatusSelector";
import { ActivityRelationField } from "@/features/event-detail/ActivityRelationField";
import { validateCreateEvent } from "@/lib/events/validate-event";
import type { UserProfile } from "@/types/auth";
import type {
  ActivityStatus,
  CreateEventInput,
  EventPriority,
  EventType,
  RetoStatus,
  TeamEvent,
} from "@/types/event";
import { DescriptionField } from "./fields/DescriptionField";
import { ResolutionField } from "./fields/ResolutionField";
import { TagsInputField } from "./fields/TagsInputField";
import { TitleField } from "./fields/TitleField";
import { EventTypeSelector } from "./EventTypeSelector";
import { StatusToggle } from "./StatusToggle";
import { PrioritySelector } from "@/features/event-detail/PrioritySelector";
import styles from "./EventForm.module.css";

interface EventFormProps {
  environmentId: string;
  currentUser: UserProfile;
  activities: TeamEvent[];
  onSubmit: (input: CreateEventInput) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({
  environmentId,
  currentUser,
  activities,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [type, setType] = useState<EventType>("actividad");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("");
  const [involved, setInvolved] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [relatedActivityId, setRelatedActivityId] = useState<string | null>(
    null,
  );
  const [activityStatus, setActivityStatus] =
    useState<ActivityStatus>("terminada");
  const [retoStatus, setRetoStatus] = useState<RetoStatus>("abierto");
  const [priority, setPriority] = useState<EventPriority>("media");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    created_by?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleTypeChange = (next: EventType) => {
    setType(next);
    if (next === "actividad") {
      setResolution("");
      setRelatedActivityId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const input: CreateEventInput = {
      environment_id: environmentId,
      type,
      created_by: currentUser.full_name,
      created_by_user_id: currentUser.id,
      title,
      description,
      involved,
      tags,
      resolution: type === "reto" ? resolution : null,
      status: type === "reto" ? retoStatus : activityStatus,
      priority,
      related_activity_id: type === "reto" ? relatedActivityId : null,
    };

    const validation = validateCreateEvent(input);
    setErrors(validation.errors);
    if (!validation.ok) return;

    try {
      setSubmitting(true);
      await onSubmit(input);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar el evento.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.sectionLabel}>Carga: {currentUser.full_name}</p>
      <EventTypeSelector value={type} onChange={handleTypeChange} />

      <TitleField value={title} onChange={setTitle} error={errors.title} />

      <DescriptionField
        value={description}
        onChange={setDescription}
        error={errors.description}
      />

      <PrioritySelector value={priority} onChange={setPriority} />

      {type === "actividad" ? (
        <div className={styles.statusBlock}>
          <span className={styles.sectionLabel}>Estado de la actividad</span>
          <ActivityStatusSelector
            value={activityStatus}
            onChange={setActivityStatus}
          />
        </div>
      ) : (
        <>
          <ActivityRelationField
            activities={activities}
            value={relatedActivityId}
            onChange={setRelatedActivityId}
          />
          <ResolutionField value={resolution} onChange={setResolution} />
          <StatusToggle value={retoStatus} onChange={setRetoStatus} />
        </>
      )}

      <div className={styles.row}>
        <TagsInputField
          label="Personas involucradas"
          values={involved}
          onChange={setInvolved}
          placeholder="Nombre + Enter"
        />
        <TagsInputField
          label="Etiquetas"
          values={tags}
          onChange={setTags}
          placeholder="#tema o web + Enter"
          hint="Con # es etiqueta. Sin # se trata como link web."
        />
      </div>

      {formError ? <p className={styles.formError}>{formError}</p> : null}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar evento"}
        </button>
      </div>
    </form>
  );
}
