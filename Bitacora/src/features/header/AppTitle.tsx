"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_BITACORA_TITLE } from "@/types/environment";
import styles from "./AppTitle.module.css";

interface AppTitleProps {
  title?: string;
  editable?: boolean;
  onSave?: (title: string) => Promise<void> | void;
}

export function AppTitle({
  title = DEFAULT_BITACORA_TITLE,
  editable = false,
  onSave,
}: AppTitleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [title, editing]);

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editing]);

  const startEdit = () => {
    if (!editable || !onSave) return;
    setDraft(title);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(title);
    setEditing(false);
  };

  const commit = async () => {
    if (!onSave) return;
    const next = draft.trim() || DEFAULT_BITACORA_TITLE;
    if (next === title) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      await onSave(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={styles.input}
        value={draft}
        disabled={saving}
        aria-label="Título de la bitácora"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          void commit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
      />
    );
  }

  return (
    <h1
      className={`${styles.root} ${editable ? styles.editable : ""}`}
      title={editable ? "Doble clic para editar el título" : undefined}
      onDoubleClick={startEdit}
    >
      {title}
    </h1>
  );
}
