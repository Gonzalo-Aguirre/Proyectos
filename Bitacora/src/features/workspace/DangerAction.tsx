"use client";

import { useState } from "react";
import styles from "./DangerAction.module.css";

interface DangerActionProps {
  label: string;
  confirmLabel?: string;
  hint?: string;
  onConfirm: () => Promise<void>;
}

export function DangerAction({
  label,
  confirmLabel = "Confirmar eliminación",
  hint,
  onConfirm,
}: DangerActionProps) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    try {
      setBusy(true);
      setError(null);
      await onConfirm();
      setConfirming(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo completar la acción.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {!confirming ? (
        <button
          type="button"
          className={styles.danger}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
        >
          {label}
        </button>
      ) : (
        <div className={styles.confirmBox}>
          <p className={styles.warn}>¿Seguro? Esta acción no se puede deshacer.</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              disabled={busy}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.confirm}
              disabled={busy}
              onClick={() => void run()}
            >
              {busy ? "Eliminando…" : confirmLabel}
            </button>
          </div>
        </div>
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
