import type { TeamEvent } from "@/types/event";

export function searchEvents(events: TeamEvent[], query: string): TeamEvent[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return events;

  return events.filter((event) => {
    const haystack = [
      event.title,
      event.description,
      event.created_by,
      event.resolution ?? "",
      ...event.involved,
      ...event.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
