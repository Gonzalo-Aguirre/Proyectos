import type { EventType } from "@/types/event";
import styles from "./EventTypeSelector.module.css";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (value: EventType) => void;
}

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  return (
    <div className={styles.root} role="group" aria-label="Tipo de evento">
      <button
        type="button"
        className={`${styles.option} ${value === "actividad" ? styles.optionActive : ""}`}
        onClick={() => onChange("actividad")}
        aria-pressed={value === "actividad"}
      >
        <span className={styles.label}>Actividad</span>
        <span className={styles.hint}>Trabajo hecho, deploy, avance</span>
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === "reto" ? styles.optionActive : ""}`}
        onClick={() => onChange("reto")}
        aria-pressed={value === "reto"}
      >
        <span className={styles.label}>Reto</span>
        <span className={styles.hint}>Con estado y resolución</span>
      </button>
    </div>
  );
}
