"use client";

import { X } from "lucide-react";
import styles from "./SidePanel.module.css";

interface SidePanelProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export function SidePanel({ title, onClose, children }: SidePanelProps) {
  return (
    <aside className={styles.root} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {onClose ? (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
