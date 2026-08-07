"use client";

import {
  ACTIVITY_STATUS_OPTIONS,
  type ActivityStatus,
} from "@/types/event";
import styles from "./ActivityStatusSelector.module.css";

interface ActivityStatusSelectorProps {
  value: ActivityStatus;
  onChange: (value: ActivityStatus) => void;
  disabled?: boolean;
}

function activeClass(status: ActivityStatus): string {
  if (status === "por_iniciar") return styles.porIniciarActive;
  if (status === "en_progreso") return styles.enProgresoActive;
  return styles.terminadaActive;
}

export function ActivityStatusSelector({
  value,
  onChange,
  disabled = false,
}: ActivityStatusSelectorProps) {
  return (
    <div
      className={styles.root}
      role="group"
      aria-label="Estado de la actividad"
    >
      {ACTIVITY_STATUS_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`${styles.button} ${selected ? activeClass(option.id) : ""}`}
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => {
              if (!selected) onChange(option.id);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
