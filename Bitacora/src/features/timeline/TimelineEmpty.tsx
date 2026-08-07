import styles from "./TimelineEmpty.module.css";

interface TimelineEmptyProps {
  title?: string;
  message?: string;
}

export function TimelineEmpty({
  title = "Sin eventos",
  message = "No hay registros con estos filtros. Probá otra búsqueda o agregá un evento.",
}: TimelineEmptyProps) {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.copy}>{message}</p>
    </div>
  );
}
