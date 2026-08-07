import type { WorkEnvironment } from "@/types/environment";
import type { TeamEvent } from "@/types/event";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function eventsToCsv(
  events: TeamEvent[],
  environments: WorkEnvironment[],
): string {
  const envName = new Map(environments.map((env) => [env.id, env.name]));

  const headers = [
    "fecha",
    "entorno",
    "tipo",
    "estado",
    "titulo",
    "descripcion",
    "resolucion",
    "cargado_por",
    "involucrados",
    "etiquetas",
  ];

  const rows = events.map((event) =>
    [
      event.created_at,
      envName.get(event.environment_id) ?? event.environment_id,
      event.type,
      event.status,
      event.title,
      event.description,
      event.resolution ?? "",
      event.created_by,
      event.involved.join("; "),
      event.tags.join("; "),
    ]
      .map((cell) => escapeCsv(String(cell)))
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
