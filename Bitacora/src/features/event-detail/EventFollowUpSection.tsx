"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatEventDate } from "@/lib/date/format";
import type { EventItem } from "@/types/event";
import styles from "./EventFollowUpSection.module.css";

interface EventFollowUpSectionProps {
  items?: EventItem[];
  loading?: boolean;
  /** display = vista completa; composer = panel de edición */
  mode: "display" | "composer";
  onAddItem?: (body: string) => Promise<void>;
}

export function EventFollowUpSection({
  items = [],
  loading = false,
  mode,
  onAddItem,
}: EventFollowUpSectionProps) {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!onAddItem) return;

    if (!user?.full_name) {
      setError("Tenés que estar logueado para agregar un avance.");
      return;
    }

    const body = draft.trim();
    if (!body) {
      setError("Escribí el avance antes de guardar.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onAddItem(body);
      setDraft("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el avance.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "display") {
    return (
      <section className={styles.display} aria-label="Seguimiento">
        <h3 className={styles.sectionTitle}>Seguimiento</h3>

        {loading ? <p className={styles.muted}>Cargando avances…</p> : null}

        {!loading && items.length === 0 ? (
          <p className={styles.muted}>Todavía no hay avances registrados.</p>
        ) : null}

        {!loading && items.length > 0 ? (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemMeta}>
                  <span>{item.created_by}</span>
                  <span className={styles.dot} aria-hidden />
                  <time dateTime={item.created_at}>
                    {formatEventDate(item.created_at)}
                  </time>
                </div>
                <p className={styles.itemBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  return (
    <section className={styles.composerRoot} aria-label="Agregar avance">
      <div className={styles.header}>
        <h3 className={styles.title}>Agregar avance</h3>
        <p className={styles.hint}>
          Se suma a la vista completa de la tarjeta. Acá solo cargás.
        </p>
      </div>

      {items.length > 0 ? (
        <p className={styles.muted}>
          {items.length} avance{items.length === 1 ? "" : "s"} en la tarjeta.
        </p>
      ) : null}

      <div className={styles.composer}>
        <label className={styles.label} htmlFor="event-follow-up">
          Nuevo avance
        </label>
        <textarea
          id="event-follow-up"
          className={styles.textarea}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Qué avanzó, qué cambió, próximo paso…"
          rows={3}
        />
        <p className={styles.actor}>Como: {user?.full_name ?? "—"}</p>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.submit}
            disabled={submitting || !onAddItem}
            onClick={() => void submit()}
          >
            {submitting ? "Guardando…" : "Agregar avance"}
          </button>
        </div>
      </div>
    </section>
  );
}
