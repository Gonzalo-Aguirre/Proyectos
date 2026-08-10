"use client";

import { useEffect, useState } from "react";
import styles from "./EventTextEditor.module.css";

interface EventTextEditorProps {
  title: string;
  description: string;
  onSave: (input: { title: string; description: string }) => Promise<void>;
}

export function EventTextEditor({
  title,
  description,
  onSave,
}: EventTextEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraftTitle(title);
      setDraftDescription(description);
    }
  }, [title, description, editing]);

  const startEdit = () => {
    setDraftTitle(title);
    setDraftDescription(description);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setDraftTitle(title);
    setDraftDescription(description);
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    if (!draftTitle.trim() || !draftDescription.trim()) {
      setError("Título y descripción son obligatorios.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave({
        title: draftTitle.trim(),
        description: draftDescription.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron guardar los textos.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Textos</h3>
        {!editing ? (
          <button type="button" className={styles.edit} onClick={startEdit}>
            Editar
          </button>
        ) : null}
      </div>

      {!editing ? (
        <p className={styles.muted}>
          Título y descripción se ven en la tarjeta. Editá acá para cambiarlos.
        </p>
      ) : (
        <div className={styles.panel}>
          <label className={styles.label} htmlFor="edit-title">
            Título
          </label>
          <input
            id="edit-title"
            className={styles.input}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
          />
          <label className={styles.label} htmlFor="edit-description">
            Descripción
          </label>
          <textarea
            id="edit-description"
            className={styles.textarea}
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            rows={4}
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
      )}
    </div>
  );
}
