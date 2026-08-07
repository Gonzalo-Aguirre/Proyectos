import type { TeamEvent, TimelineFilter } from "@/types/event";

export function filterEventsByType(
  events: TeamEvent[],
  filter: TimelineFilter,
): TeamEvent[] {
  switch (filter) {
    case "actividades":
      return events.filter((event) => event.type === "actividad");
    case "problemas_abiertos":
      return events.filter(
        (event) => event.type === "problema" && event.status === "abierto",
      );
    case "problemas_resueltos":
      return events.filter(
        (event) => event.type === "problema" && event.status === "resuelto",
      );
    case "todos":
    default:
      return events;
  }
}
