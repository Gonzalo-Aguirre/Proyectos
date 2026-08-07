import styles from "./field.module.css";

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TitleField({ value, onChange, error }: TitleFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="event-title">
        Título
      </label>
      <input
        id="event-title"
        className={styles.control}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='Ej: "Deploy del módulo X"'
      />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
