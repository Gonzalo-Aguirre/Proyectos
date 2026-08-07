import type { ActivityStatus, EventStatus, TeamEvent } from "@/types/event";

export function isActivityStatus(status: EventStatus): status is ActivityStatus {
  return (
    status === "por_iniciar" ||
    status === "en_progreso" ||
    status === "terminada"
  );
}

export function getActivityStatus(event: TeamEvent): ActivityStatus {
  if (event.type !== "actividad") return "terminada";
  if (isActivityStatus(event.status)) return event.status;
  return "terminada";
}
