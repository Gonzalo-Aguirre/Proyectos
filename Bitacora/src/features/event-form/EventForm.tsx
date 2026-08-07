"use client";

import { useState } from "react";
import { ActivityStatusSelector } from "@/features/activity-status/ActivityStatusSelector";
import { validateCreateEvent } from "@/lib/events/validate-event";
import type { UserProfile } from "@/types/auth";
import type {
  ActivityStatus,
  CreateEventInput,
  EventType,
  ProblemStatus,
} from "@/types/event";
import { DescriptionField } from "./fields/DescriptionField";
import { ResolutionField } from "./fields/ResolutionField";
import { TagsInputField } from "./fields/TagsInputField";
import { TitleField } from "./fields/TitleField";
import { EventTypeSelector } from "./EventTypeSelector";
import { StatusToggle } from "./StatusToggle";
import styles from "./EventForm.module.css";

interface EventFormProps {
  environmentId: string;
  currentUser: UserProfile;
  onSubmit: (input: CreateEventInput) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({
  environmentId,
  currentUser,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [type, setType] = useState<EventType>("actividad");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("");
  const [involved, setInvolved] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activityStatus, setActivityStatus] =
    useState<ActivityStatus>("terminada");
  const [problemStatus, setProblemStatus] = useState<ProblemStatus>("abierto");
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
      resolution: type === "problema" ? resolution : null,
      status: type === "problema" ? problemStatus : activityStatus,
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
          <ResolutionField value={resolution} onChange={setResolution} />
          <StatusToggle value={problemStatus} onChange={setProblemStatus} />
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
          placeholder="tag + Enter"
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
