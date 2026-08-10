import type { RetoStatus } from "@/types/event";
import styles from "./StatusToggle.module.css";

interface StatusToggleProps {
  value: RetoStatus;
  onChange: (value: RetoStatus) => void;
}

export function StatusToggle({ value, onChange }: StatusToggleProps) {
  return (
    <div className={styles.root}>
      <span className={styles.label}>Estado</span>
      <div className={styles.group}>
        <button
          type="button"
          className={`${styles.option} ${value === "abierto" ? styles.optionActive : ""}`}
          onClick={() => onChange("abierto")}
          aria-pressed={value === "abierto"}
        >
          Abierto
        </button>
        <button
          type="button"
          className={`${styles.option} ${value === "resuelto" ? styles.optionActive : ""}`}
          onClick={() => onChange("resuelto")}
          aria-pressed={value === "resuelto"}
        >
          Resuelto
        </button>
      </div>
    </div>
  );
}
