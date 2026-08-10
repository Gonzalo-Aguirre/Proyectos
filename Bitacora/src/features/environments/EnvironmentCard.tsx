import { formatEventDate } from "@/lib/date/format";
import type { WorkEnvironment } from "@/types/environment";
import styles from "./EnvironmentCard.module.css";

interface EnvironmentCardProps {
  environment: WorkEnvironment;
  selected?: boolean;
  /** Clic simple: seleccionar en el panel. */
  onSelect: (environment: WorkEnvironment) => void;
  /** Doble clic: abrir bitácora. */
  onOpen: (environment: WorkEnvironment) => void;
}

export function EnvironmentCard({
  environment,
  selected = false,
  onSelect,
  onOpen,
}: EnvironmentCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.root} ${selected ? styles.selected : ""}`}
      title="Clic para seleccionar · Doble clic para abrir"
      onClick={() => onSelect(environment)}
      onDoubleClick={() => onOpen(environment)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onOpen(environment);
          return;
        }
        if (event.key === " ") {
          event.preventDefault();
          onSelect(environment);
        }
      }}
    >
      <div className={styles.titleRow}>
        <span className={styles.name}>{environment.name}</span>
        {environment.is_shared ? (
          <span className={styles.sharedBadge}>Compartido</span>
        ) : null}
      </div>
      {environment.description ? (
        <p className={styles.description}>{environment.description}</p>
      ) : null}
      <p className={styles.meta}>
        Creado por {environment.created_by} ·{" "}
        {formatEventDate(environment.created_at)}
        {environment.my_role === "viewer" ? " · Solo lectura" : ""}
      </p>
    </div>
  );
}
