"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getEnvironmentRepository,
  getEventRepository,
} from "@/data/providers";
import { useAuth } from "@/features/auth/AuthProvider";
import { AddEventFab } from "@/features/fab/AddEventFab";
import { EventDetailModal } from "@/features/event-detail/EventDetailModal";
import { EventFormModal } from "@/features/event-form/EventFormModal";
import { CsvExportButton } from "@/features/export/CsvExportButton";
import { FilterBar } from "@/features/filters/FilterBar";
import { AppHeader } from "@/features/header/AppHeader";
import { SearchBar } from "@/features/search/SearchBar";
import { LastActivityIndicator } from "@/features/timeline/LastActivityIndicator";
import { Timeline } from "@/features/timeline/Timeline";
import { filterEventsByType } from "@/lib/events/filter-events";
import { searchEvents } from "@/lib/events/search-events";
import type { WorkEnvironment } from "@/types/environment";
import type {
  ActivityStatus,
  ChangeStatusInput,
  CreateEventInput,
  TeamEvent,
  TimelineFilter,
} from "@/types/event";
import styles from "./BitacoraApp.module.css";

interface BitacoraAppProps {
  environmentId: string;
}

export function BitacoraApp({ environmentId }: BitacoraAppProps) {
  const { user } = useAuth();
  const eventsRepo = useMemo(() => getEventRepository(), []);
  const envRepo = useMemo(() => getEnvironmentRepository(), []);

  const [environment, setEnvironment] = useState<WorkEnvironment | null>(null);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimelineFilter>("todos");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TeamEvent | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [env, data] = await Promise.all([
        envRepo.getById(environmentId),
        eventsRepo.listByEnvironment(environmentId),
      ]);
      setEnvironment(env);
      setEvents(data);
      if (!env) {
        setError("Este entorno no existe o fue eliminado.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los eventos.",
      );
    } finally {
      setLoading(false);
    }
  }, [environmentId, envRepo, eventsRepo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleEvents = useMemo(() => {
    const filtered = filterEventsByType(events, filter);
    return searchEvents(filtered, query);
  }, [events, filter, query]);

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDetail = useCallback(() => setSelected(null), []);

  const handleCreate = async (input: CreateEventInput) => {
    await eventsRepo.create(input);
    await refresh();
    setFormOpen(false);
  };

  const handleChangeStatus = async (input: ChangeStatusInput) => {
    if (!selected) return;

    const updated = await eventsRepo.update(selected.id, {
      status: input.status,
      resolution: input.resolution ?? selected.resolution,
      status_changed_by: input.changed_by,
      status_changed_at: new Date().toISOString(),
    });

    setSelected(updated);
    await refresh();
  };

  const handleChangeActivityStatus = async (status: ActivityStatus) => {
    if (!selected) return;

    const updated = await eventsRepo.update(selected.id, { status });
    setSelected(updated);
    await refresh();
  };

  if (!user) return null;

  return (
    <div className="appShell">
      <AppHeader
        environmentName={environment?.name}
        showBackToEnvironments
      />

      <div className="toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar value={filter} onChange={setFilter} />
        <div className={styles.metaRow}>
          <LastActivityIndicator events={events} />
          <CsvExportButton environmentId={environmentId} />
        </div>
      </div>

      <main className="main">
        {loading ? <p>Cargando bitácora…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!loading && !error ? (
          <Timeline
            events={visibleEvents}
            onSelect={(event) => setSelected(event)}
          />
        ) : null}
      </main>

      <AddEventFab onClick={() => setFormOpen(true)} />

      <EventFormModal
        open={formOpen}
        environmentId={environmentId}
        currentUser={user}
        onClose={closeForm}
        onSubmit={handleCreate}
      />

      <EventDetailModal
        event={selected}
        open={Boolean(selected)}
        onClose={closeDetail}
        onChangeStatus={handleChangeStatus}
        onChangeActivityStatus={handleChangeActivityStatus}
      />
    </div>
  );
}
