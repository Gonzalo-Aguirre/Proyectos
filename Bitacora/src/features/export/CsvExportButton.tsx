"use client";

import { useState } from "react";
import {
  getEnvironmentRepository,
  getEventItemRepository,
  getEventRepository,
} from "@/data/providers";
import { useAuth } from "@/features/auth/AuthProvider";
import type { EventItem } from "@/types/event";
import { downloadCsv, eventsToCsv } from "./events-to-csv";
import styles from "./CsvExportButton.module.css";

interface CsvExportButtonProps {
  /** Si se pasa, exporta solo ese entorno. Si no, exporta todo. */
  environmentId?: string;
  /** Usuario actual (opcional; si no se pasa se usa la sesión). */
  userId?: string;
}

export function CsvExportButton({
  environmentId,
  userId,
}: CsvExportButtonProps) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const resolvedUserId = userId ?? user?.id;
    if (!resolvedUserId) return;

    try {
      setBusy(true);
      const eventsRepo = getEventRepository();
      const itemsRepo = getEventItemRepository();
      const envRepo = getEnvironmentRepository();
      const [events, environments] = await Promise.all([
        environmentId
          ? eventsRepo.listByEnvironment(environmentId)
          : eventsRepo.listAll(),
        envRepo.list(resolvedUserId),
      ]);

      const items = await itemsRepo.listByEvents(events.map((event) => event.id));
      const itemsByEvent = new Map<string, EventItem[]>();
      for (const item of items) {
        const list = itemsByEvent.get(item.event_id) ?? [];
        list.push(item);
        itemsByEvent.set(item.event_id, list);
      }

      const csv = eventsToCsv(events, environments, itemsByEvent);
      const stamp = new Date().toISOString().slice(0, 10);
      const name = environmentId
        ? `bitacora-entorno-${stamp}.csv`
        : `bitacora-completa-${stamp}.csv`;
      downloadCsv(name, csv);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.root}
      onClick={() => void handleExport()}
      disabled={busy}
      title="Exportar CSV"
      aria-label="Exportar datos a CSV"
    >
      {busy ? "…" : "csv"}
    </button>
  );
}
