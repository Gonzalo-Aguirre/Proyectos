import styles from "./EventDetailResolution.module.css";

interface EventDetailResolutionProps {
  resolution: string;
}

export function EventDetailResolution({
  resolution,
}: EventDetailResolutionProps) {
  return (
    <div className={styles.root}>
      <p className={styles.label}>Solución</p>
      <p className={styles.copy}>{resolution}</p>
    </div>
  );
}
