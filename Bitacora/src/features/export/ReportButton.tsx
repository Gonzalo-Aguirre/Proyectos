"use client";

import { useState } from "react";
import {
  buildWordReportBlob,
  downloadBlob,
  filterLabelFromState,
} from "@/features/export/build-word-report";
import { resolveBitacoraTitle } from "@/types/environment";
import type { EventItem, TeamEvent, TimelineFilter } from "@/types/event";
import styles from "./ReportButton.module.css";

interface ReportButtonProps {
  environmentName: string;
  bitacoraTitle?: string | null;
  visibleEvents: TeamEvent[];
  allEvents: TeamEvent[];
  filter: TimelineFilter;
  query: string;
  loadItemsByEvent: (eventIds: string[]) => Promise<Map<string, EventItem[]>>;
}

export function ReportButton({
  environmentName,
  bitacoraTitle,
  visibleEvents,
  allEvents,
  filter,
  query,
  loadItemsByEvent,
}: ReportButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setBusy(true);
      setError(null);

      const ids = new Set<string>();
      for (const event of visibleEvents) {
        ids.add(event.id);
        if (event.type === "actividad") {
          for (const related of allEvents) {
            if (
              related.type === "reto" &&
              related.related_activity_id === event.id
            ) {
              ids.add(related.id);
            }
          }
        }
        if (event.type === "reto" && event.related_activity_id) {
          ids.add(event.related_activity_id);
        }
      }

      const itemsByEvent = await loadItemsByEvent([...ids]);
      const blob = await buildWordReportBlob({
        bitacoraTitle: resolveBitacoraTitle(bitacoraTitle),
        environmentName,
        generatedAt: new Date(),
        visibleEvents,
        allEvents,
        itemsByEvent,
        filterLabel: filterLabelFromState(filter, query),
      });

      const stamp = new Date().toISOString().slice(0, 10);
      const safeName = environmentName
        .trim()
        .replace(/[^\w\-]+/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 40);
      downloadBlob(`reporte-${safeName || "entorno"}-${stamp}.docx`, blob);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo generar el reporte.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.root}
        onClick={() => void handleClick()}
        disabled={busy}
        title="Descargar informe Word de actividades y retos"
      >
        {busy ? "Generando…" : "Reporte"}
      </button>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
