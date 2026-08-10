"use client";

import {
  EVENT_PRIORITY_OPTIONS,
  type EventPriority,
} from "@/types/event";
import styles from "./PrioritySelector.module.css";

interface PrioritySelectorProps {
  value: EventPriority;
  onChange: (value: EventPriority) => void;
  disabled?: boolean;
}

export function PrioritySelector({
  value,
  onChange,
  disabled = false,
}: PrioritySelectorProps) {
  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor="event-priority">
        Prioridad
      </label>
      <select
        id="event-priority"
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as EventPriority)}
      >
        {EVENT_PRIORITY_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
