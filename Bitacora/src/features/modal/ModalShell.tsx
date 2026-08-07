"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalShell.module.css";

interface ModalShellProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BODY_LOCK_CLASS = "bitacora-modal-open";

export function ModalShell({ title, open, onClose, children }: ModalShellProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add(BODY_LOCK_CLASS);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove(BODY_LOCK_CLASS);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
