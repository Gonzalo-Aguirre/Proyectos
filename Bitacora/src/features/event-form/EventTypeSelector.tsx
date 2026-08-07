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
        <span className={styles.label}>Actividad realizada</span>
        <span className={styles.hint}>Trabajo hecho, deploy, avance</span>
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === "problema" ? styles.optionActive : ""}`}
        onClick={() => onChange("problema")}
        aria-pressed={value === "problema"}
      >
        <span className={styles.label}>Problema / Incidente</span>
        <span className={styles.hint}>Con estado y resolución</span>
      </button>
    </div>
  );
}
