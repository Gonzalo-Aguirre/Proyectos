import type { EventStatus, EventType } from "@/types/event";
import styles from "./EventCardStatus.module.css";

interface EventCardStatusProps {
  type: EventType;
  status: EventStatus;
}

function labelFor(type: EventType, status: EventStatus): string {
  if (type === "actividad") return "Actividad";
  if (status === "resuelto") return "Resuelto";
  return "Abierto";
}

function toneFor(type: EventType, status: EventStatus): string {
  if (type === "actividad") return styles.actividad;
  if (status === "resuelto") return styles.resuelto;
  return styles.abierto;
}

export function EventCardStatus({ type, status }: EventCardStatusProps) {
  return (
    <span className={`${styles.root} ${toneFor(type, status)}`}>
      {labelFor(type, status)}
    </span>
  );
}
