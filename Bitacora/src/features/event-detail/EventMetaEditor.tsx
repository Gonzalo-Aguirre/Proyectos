"use client";

import { useEffect, useState } from "react";
import { TagsInputField } from "@/features/event-form/fields/TagsInputField";
import styles from "./EventMetaEditor.module.css";

interface EventMetaEditorProps {
  involved: string[];
  tags: string[];
  onSave?: (input: { involved: string[]; tags: string[] }) => Promise<void>;
}

/** Solo acciones de edición; la lectura vive en la vista completa. */
export function EventMetaEditor({
  involved,
  tags,
  onSave,
}: EventMetaEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draftInvolved, setDraftInvolved] = useState(involved);
  const [draftTags, setDraftTags] = useState(tags);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraftInvolved(involved);
      setDraftTags(tags);
    }
  }, [involved, tags, editing]);

  if (!onSave) return null;

  const startEdit = () => {
    setDraftInvolved(involved);
    setDraftTags(tags);
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraftInvolved(involved);
    setDraftTags(tags);
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave({ involved: draftInvolved, tags: draftTags });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar involucrados y etiquetas.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Involucrados y etiquetas</h3>
        {!editing ? (
          <button type="button" className={styles.edit} onClick={startEdit}>
            Editar
          </button>
        ) : null}
      </div>

      {!editing ? (
        <p className={styles.muted}>
          {involved.length} involucrado{involved.length === 1 ? "" : "s"} ·{" "}
          {tags.length} etiqueta{tags.length === 1 ? "" : "s"} en la tarjeta.
        </p>
      ) : (
        <div className={styles.editPanel}>
          <div className={styles.fields}>
            <TagsInputField
              label="Personas involucradas"
              values={draftInvolved}
              onChange={setDraftInvolved}
              placeholder="Nombre + Enter"
            />
            <TagsInputField
              label="Etiquetas"
              values={draftTags}
              onChange={setDraftTags}
              placeholder="#tema o web + Enter"
              hint="Con # es etiqueta. Sin # se trata como link web."
            />
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={cancelEdit}
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
