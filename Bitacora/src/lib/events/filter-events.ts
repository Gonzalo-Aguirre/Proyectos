import type { TeamEvent, TimelineFilter } from "@/types/event";

export function filterEventsByType(
  events: TeamEvent[],
  filter: TimelineFilter,
): TeamEvent[] {
  switch (filter) {
    case "actividades":
      return events.filter((event) => event.type === "actividad");
    case "retos_abiertos":
      return events.filter(
        (event) => event.type === "reto" && event.status === "abierto",
      );
    case "retos_resueltos":
      return events.filter(
        (event) => event.type === "reto" && event.status === "resuelto",
      );
    case "todos":
    default:
      return events;
  }
}
