import styles from "./field.module.css";

interface ResolutionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResolutionField({ value, onChange }: ResolutionFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="event-resolution">
        ¿Cómo se resolvió?
      </label>
      <textarea
        id="event-resolution"
        className={`${styles.control} ${styles.textarea}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Opcional si todavía está abierto"
      />
    </div>
  );
}
