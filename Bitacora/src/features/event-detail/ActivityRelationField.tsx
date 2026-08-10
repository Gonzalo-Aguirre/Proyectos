"use client";

import { useState } from "react";
import type { TeamEvent } from "@/types/event";
import styles from "./ActivityRelationField.module.css";

interface ActivityRelationFieldProps {
  activities: TeamEvent[];
  value: string | null;
  onChange: (activityId: string | null) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
}

export function ActivityRelationField({
  activities,
  value,
  onChange,
  label = "Actividad relacionada",
  hint = "Opcional. Vinculá este reto a una actividad del entorno.",
  compact = false,
}: ActivityRelationFieldProps) {
  return (
    <div className={compact ? styles.compact : styles.field}>
      <label className={styles.label} htmlFor="related-activity">
        {label}
      </label>
      <select
        id="related-activity"
        className={styles.select}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value ? event.target.value : null)
        }
      >
        <option value="">Sin relación</option>
        {activities.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.title}
          </option>
        ))}
      </select>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {!compact && activities.length === 0 ? (
        <span className={styles.hint}>
          Todavía no hay actividades en este entorno.
        </span>
      ) : null}
    </div>
  );
}

interface EventRelationPanelProps {
  event: TeamEvent;
  activities: TeamEvent[];
  relatedActivity: TeamEvent | null;
  relatedRetos: TeamEvent[];
  /** display = vista completa; edit = panel (solo acciones) */
  mode?: "display" | "edit";
  onSaveRelation?: (relatedActivityId: string | null) => Promise<void>;
  onOpenRelated?: (event: TeamEvent) => void;
}

export function EventRelationPanel({
  event,
  activities,
  relatedActivity,
  relatedRetos,
  mode = "display",
  onSaveRelation,
  onOpenRelated,
}: EventRelationPanelProps) {
  const isReto = event.type === "reto";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(event.related_activity_id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(event.related_activity_id);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(event.related_activity_id);
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    if (!onSaveRelation) return;
    try {
      setSaving(true);
      setError(null);
      await onSaveRelation(draft);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la relación.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (mode === "edit" && isReto) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Relación</h3>
          {onSaveRelation && !editing ? (
            <button type="button" className={styles.edit} onClick={startEdit}>
              Editar
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className={styles.editBox}>
            <ActivityRelationField
              activities={activities}
              value={draft}
              onChange={setDraft}
              compact
            />
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancel}
                onClick={cancel}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.save}
                onClick={() => void save()}
                disabled={saving}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <p className={styles.muted}>
            {relatedActivity
              ? `Vinculado a “${relatedActivity.title}” (se ve en la tarjeta).`
              : "Sin actividad relacionada. Editá para vincular."}
          </p>
        )}
      </div>
    );
  }

  if (mode === "edit" && !isReto) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Retos vinculados</h3>
        </div>
        <p className={styles.muted}>
          {relatedRetos.length === 0
            ? "Ningún reto apunta a esta actividad."
            : `${relatedRetos.length} reto${relatedRetos.length === 1 ? "" : "s"} visibles en la tarjeta.`}
        </p>
      </div>
    );
  }

  if (isReto) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Relación</h3>
        </div>
        {relatedActivity ? (
          <button
            type="button"
            className={styles.linkCard}
            onClick={() => onOpenRelated?.(relatedActivity)}
          >
            <span className={styles.linkKind}>Actividad</span>
            <span className={styles.linkTitle}>{relatedActivity.title}</span>
          </button>
        ) : (
          <p className={styles.muted}>Sin actividad relacionada.</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Retos vinculados</h3>
      </div>
      {relatedRetos.length === 0 ? (
        <p className={styles.muted}>Ningún reto apunta a esta actividad.</p>
      ) : (
        <div className={styles.linkList}>
          {relatedRetos.map((reto) => (
            <button
              key={reto.id}
              type="button"
              className={styles.linkCard}
              onClick={() => onOpenRelated?.(reto)}
            >
              <span className={styles.linkKind}>
                {reto.status === "resuelto" ? "Resuelto" : "Abierto"}
              </span>
              <span className={styles.linkTitle}>{reto.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
