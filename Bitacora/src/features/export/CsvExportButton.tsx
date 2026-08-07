"use client";

import { useState } from "react";
import {
  getEnvironmentRepository,
  getEventRepository,
} from "@/data/providers";
import { downloadCsv, eventsToCsv } from "./events-to-csv";
import styles from "./CsvExportButton.module.css";

interface CsvExportButtonProps {
  /** Si se pasa, exporta solo ese entorno. Si no, exporta todo. */
  environmentId?: string;
}

export function CsvExportButton({ environmentId }: CsvExportButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      setBusy(true);
      const eventsRepo = getEventRepository();
      const envRepo = getEnvironmentRepository();
      const [events, environments] = await Promise.all([
        environmentId
          ? eventsRepo.listByEnvironment(environmentId)
          : eventsRepo.listAll(),
        envRepo.list(),
      ]);

      const csv = eventsToCsv(events, environments);
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
