"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { ResolutionField } from "@/features/event-form/fields/ResolutionField";
import type { ChangeStatusInput, TeamEvent } from "@/types/event";
import styles from "./EventStatusChangeForm.module.css";

interface EventStatusChangeFormProps {
  event: TeamEvent;
  onChangeStatus: (input: ChangeStatusInput) => Promise<void>;
}

export function EventStatusChangeForm({
  event,
  onChangeStatus,
}: EventStatusChangeFormProps) {
  const { user } = useAuth();
  const [resolution, setResolution] = useState(event.resolution ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOpen = event.status === "abierto";

  const submit = async (status: "abierto" | "resuelto") => {
    setError(null);

    if (!user?.full_name) {
      setError("Tenés que estar logueado para cambiar el estado.");
      return;
    }

    if (status === "resuelto" && !resolution.trim() && !event.resolution) {
      setError("Indicá cómo se resolvió el reto.");
      return;
    }

    try {
      setSubmitting(true);
      await onChangeStatus({
        status,
        changed_by: user.full_name,
        resolution:
          status === "resuelto"
            ? resolution.trim() || event.resolution
            : event.resolution,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Cambiar estado</h3>
      <p className={styles.actor}>Como: {user?.full_name ?? "—"}</p>

      {isOpen ? (
        <>
          <ResolutionField value={resolution} onChange={setResolution} />
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.resolve}
              disabled={submitting}
              onClick={() => void submit("resuelto")}
            >
              {submitting ? "Guardando…" : "Marcar como resuelto"}
            </button>
          </div>
        </>
      ) : (
        <>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.reopen}
              disabled={submitting}
              onClick={() => void submit("abierto")}
            >
              {submitting ? "Guardando…" : "Reabrir reto"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
