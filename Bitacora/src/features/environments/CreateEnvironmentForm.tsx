"use client";

import { useState } from "react";
import type { CreateEnvironmentInput } from "@/types/environment";
import styles from "./CreateEnvironmentForm.module.css";

interface CreateEnvironmentFormProps {
  onSubmit: (input: CreateEnvironmentInput) => Promise<void>;
  createdBy: string;
  createdByUserId: string;
}

export function CreateEnvironmentForm({
  onSubmit,
  createdBy,
  createdByUserId,
}: CreateEnvironmentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("El nombre del entorno es obligatorio.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name,
        description,
        created_by: createdBy,
        created_by_user_id: createdByUserId,
      });
      setName("");
      setDescription("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el entorno.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      <h3 className={styles.title}>Nuevo entorno</h3>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="env-name">
          Nombre
        </label>
        <input
          id="env-name"
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder='Ej: "Cliente A", "Oficina", "Proyecto X"'
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="env-description">
          Descripción
        </label>
        <textarea
          id="env-description"
          className={styles.textarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Dónde o en qué contexto se trabajan las actividades"
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? "Creando…" : "Crear entorno"}
        </button>
      </div>
    </form>
  );
}
