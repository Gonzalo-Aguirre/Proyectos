import { formatEventDate } from "@/lib/date/format";
import type { WorkEnvironment } from "@/types/environment";
import styles from "./EnvironmentCard.module.css";

interface EnvironmentCardProps {
  environment: WorkEnvironment;
  onOpen: (environment: WorkEnvironment) => void;
}

export function EnvironmentCard({
  environment,
  onOpen,
}: EnvironmentCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.root}
      onClick={() => onOpen(environment)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(environment);
        }
      }}
    >
      <span className={styles.name}>{environment.name}</span>
      {environment.description ? (
        <p className={styles.description}>{environment.description}</p>
      ) : null}
      <p className={styles.meta}>
        Creado por {environment.created_by} ·{" "}
        {formatEventDate(environment.created_at)}
      </p>
    </div>
  );
}
