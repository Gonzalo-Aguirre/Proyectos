import type { TeamEvent } from "@/types/event";
import styles from "./EventCardBorder.module.css";

export function getEventBorderClass(event: TeamEvent): string {
  if (event.type === "actividad") {
    if (event.status === "por_iniciar") return styles.actividadPorIniciar;
    if (event.status === "en_progreso") return styles.actividadEnProgreso;
    return styles.actividadTerminada;
  }
  if (event.status === "resuelto") return styles.problemaResuelto;
  return styles.problemaAbierto;
}
