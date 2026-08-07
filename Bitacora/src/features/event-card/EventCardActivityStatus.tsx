import { ACTIVITY_STATUS_OPTIONS, type ActivityStatus } from "@/types/event";
import styles from "./EventCardActivityStatus.module.css";

interface EventCardActivityStatusProps {
  status: ActivityStatus;
}

function toneFor(status: ActivityStatus): string {
  if (status === "por_iniciar") return styles.porIniciar;
  if (status === "en_progreso") return styles.enProgreso;
  return styles.terminada;
}

export function EventCardActivityStatus({
  status,
}: EventCardActivityStatusProps) {
  const label =
    ACTIVITY_STATUS_OPTIONS.find((option) => option.id === status)?.label ??
    status;

  return <span className={`${styles.root} ${toneFor(status)}`}>{label}</span>;
}
