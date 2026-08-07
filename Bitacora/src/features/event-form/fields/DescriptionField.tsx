import styles from "./field.module.css";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DescriptionField({
  value,
  onChange,
  error,
}: DescriptionFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="event-description">
        Descripción
      </label>
      <textarea
        id="event-description"
        className={`${styles.control} ${styles.textarea}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Qué se hizo o qué pasó…"
      />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
