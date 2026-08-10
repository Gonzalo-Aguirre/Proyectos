"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getEnvironmentRepository,
  getEventItemRepository,
  getEventRepository,
} from "@/data/providers";
import { useAuth } from "@/features/auth/AuthProvider";
import { AddEventFab } from "@/features/fab/AddEventFab";
import { EventDetail } from "@/features/event-detail/EventDetail";
import { EventForm } from "@/features/event-form/EventForm";
import { EventFocusOverlay } from "@/features/event-grid/EventFocusOverlay";
import { EventGrid } from "@/features/event-grid/EventGrid";
import { CsvExportButton } from "@/features/export/CsvExportButton";
import { FilterBar } from "@/features/filters/FilterBar";
import { AppHeader } from "@/features/header/AppHeader";
import { SearchBar } from "@/features/search/SearchBar";
import { LastActivityIndicator } from "@/features/timeline/LastActivityIndicator";
import { SidePanel } from "@/features/workspace/SidePanel";
import { filterEventsByType } from "@/lib/events/filter-events";
import { searchEvents } from "@/lib/events/search-events";
import type { WorkEnvironment } from "@/types/environment";
import { canEditEnvironment } from "@/types/environment";
import type {
  ActivityStatus,
  ChangeStatusInput,
  CreateEventInput,
  EventItem,
  EventPriority,
  TeamEvent,
  TimelineFilter,
} from "@/types/event";
import styles from "./BitacoraApp.module.css";

type PanelMode = "browse" | "create" | "detail";

interface BitacoraAppProps {
  environmentId: string;
}

export function BitacoraApp({ environmentId }: BitacoraAppProps) {
  const { user } = useAuth();
  const eventsRepo = useMemo(() => getEventRepository(), []);
  const itemsRepo = useMemo(() => getEventItemRepository(), []);
  const envRepo = useMemo(() => getEnvironmentRepository(), []);

  const [environment, setEnvironment] = useState<WorkEnvironment | null>(null);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [lastUpdateById, setLastUpdateById] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimelineFilter>("todos");
  const [query, setQuery] = useState("");
  const [panelMode, setPanelMode] = useState<PanelMode>("browse");
  const [selected, setSelected] = useState<TeamEvent | null>(null);
  const [selectedItems, setSelectedItems] = useState<EventItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [env, data] = await Promise.all([
        envRepo.getById(environmentId, user.id),
        eventsRepo.listByEnvironment(environmentId),
      ]);
      setEnvironment(env);
      setEvents(data);

      const items = await itemsRepo.listByEvents(data.map((event) => event.id));
      const latest = new Map<string, string>();
      for (const event of data) {
        latest.set(event.id, event.created_at);
      }
      for (const item of items) {
        const current = latest.get(item.event_id);
        if (!current || item.created_at > current) {
          latest.set(item.event_id, item.created_at);
        }
      }
      setLastUpdateById(latest);

      if (!env) {
        setError(
          "Este entorno no existe, fue eliminado o no tenés acceso.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los eventos.",
      );
    } finally {
      setLoading(false);
    }
  }, [environmentId, envRepo, eventsRepo, itemsRepo, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selected || panelMode !== "detail") {
      setSelectedItems([]);
      setItemsLoading(false);
      return;
    }

    let cancelled = false;
    setItemsLoading(true);

    void itemsRepo
      .listByEvent(selected.id)
      .then((items) => {
        if (!cancelled) setSelectedItems(items);
      })
      .catch(() => {
        if (!cancelled) setSelectedItems([]);
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected?.id, panelMode, itemsRepo]);

  useEffect(() => {
    if (!selected) return;
    const fresh = events.find((event) => event.id === selected.id);
    if (!fresh) {
      setSelected(null);
      setPanelMode("browse");
      return;
    }
    setSelected(fresh);
    // Solo re-sincronizar cuando cambia la lista de eventos (evita pisar edits en curso).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selected intencional fuera
  }, [events]);

  const activities = useMemo(
    () => events.filter((event) => event.type === "actividad"),
    [events],
  );

  const relatedActivity = useMemo(() => {
    if (!selected?.related_activity_id) return null;
    return (
      events.find((event) => event.id === selected.related_activity_id) ?? null
    );
  }, [events, selected]);

  const relatedRetos = useMemo(() => {
    if (!selected || selected.type !== "actividad") return [];
    return events.filter(
      (event) =>
        event.type === "reto" && event.related_activity_id === selected.id,
    );
  }, [events, selected]);

  const visibleEvents = useMemo(() => {
    const filtered = filterEventsByType(events, filter);
    return searchEvents(filtered, query);
  }, [events, filter, query]);

  const canEdit = canEditEnvironment(environment?.my_role);

  const openCreate = useCallback(() => {
    if (!canEditEnvironment(environment?.my_role)) return;
    setSelected(null);
    setPanelMode("create");
  }, [environment?.my_role]);

  const openBrowse = useCallback(() => {
    setSelected(null);
    setPanelMode("browse");
  }, []);

  const openDetail = useCallback((event: TeamEvent) => {
    setSelected(event);
    setPanelMode("detail");
  }, []);

  const handleCreate = async (input: CreateEventInput) => {
    if (!canEdit) return;
    const created = await eventsRepo.create(input);
    await refresh();
    setSelected(created);
    setPanelMode("detail");
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

  const handleChangePriority = async (priority: EventPriority) => {
    if (!selected) return;

    const updated = await eventsRepo.update(selected.id, { priority });
    setSelected(updated);
    setEvents((prev) =>
      prev.map((event) => (event.id === updated.id ? updated : event)),
    );
    await refresh();
  };

  const handleUpdateTexts = async (input: {
    title: string;
    description: string;
  }) => {
    if (!selected) return;

    const updated = await eventsRepo.update(selected.id, {
      title: input.title,
      description: input.description,
    });
    setSelected(updated);
    await refresh();
  };

  const handleUpdateMeta = async (input: {
    involved: string[];
    tags: string[];
  }) => {
    if (!selected) return;

    const updated = await eventsRepo.update(selected.id, {
      involved: input.involved,
      tags: input.tags,
    });
    setSelected(updated);
    await refresh();
  };

  const handleUpdateRelation = async (relatedActivityId: string | null) => {
    if (!selected) return;

    const updated = await eventsRepo.update(selected.id, {
      related_activity_id: relatedActivityId,
    });
    setSelected(updated);
    await refresh();
  };

  const handleDeleteEvent = async () => {
    if (!selected) return;
    await eventsRepo.remove(selected.id);
    setSelected(null);
    setPanelMode("browse");
    await refresh();
  };

  const handleAddItem = async (body: string) => {
    if (!selected || !user) return;

    const created = await itemsRepo.create({
      event_id: selected.id,
      body,
      created_by: user.full_name,
      created_by_user_id: user.id,
    });
    setSelectedItems((prev) => [...prev, created]);
    setLastUpdateById((prev) => {
      const next = new Map(prev);
      next.set(selected.id, created.created_at);
      return next;
    });
  };

  const panelTitle =
    panelMode === "create"
      ? "Nuevo evento"
      : panelMode === "detail"
        ? selected?.title ?? "Detalle"
        : "Filtros y búsqueda";

  if (!user) return null;

  return (
    <div className={styles.workspace}>
      <AppHeader
        environmentName={environment?.name}
        showBackToEnvironments
      />

      <div className={styles.columns}>
        <section className={styles.gridPane} aria-label="Grilla de eventos">
          {loading ? <p className={styles.status}>Cargando bitácora…</p> : null}
          {error ? (
            <p className={styles.status} role="alert">
              {error}
            </p>
          ) : null}
          {!loading && !error ? (
            <EventGrid
              events={visibleEvents}
              selectedId={selected?.id}
              lastUpdateById={lastUpdateById}
              onSelect={openDetail}
            />
          ) : null}

          {panelMode === "detail" && selected ? (
            <EventFocusOverlay
              event={selected}
              lastUpdatedAt={lastUpdateById.get(selected.id) ?? null}
              items={selectedItems}
              itemsLoading={itemsLoading}
              relatedActivity={relatedActivity}
              relatedRetos={relatedRetos}
              onOpenRelated={openDetail}
              onClose={openBrowse}
            />
          ) : null}
        </section>

        <div className={styles.panelPane}>
          <SidePanel
            title={panelTitle}
            onClose={panelMode === "browse" ? undefined : openBrowse}
          >
            {panelMode === "browse" ? (
              <>
                <SearchBar value={query} onChange={setQuery} />
                <FilterBar value={filter} onChange={setFilter} />
                <div className={styles.panelMeta}>
                  <LastActivityIndicator events={events} />
                  <CsvExportButton environmentId={environmentId} />
                </div>
                <p className={styles.panelHint}>
                  La grilla muestra lo más reciente primero. Actividades y retos
                  usan colores distintos.
                  {canEdit ? (
                    <>
                      {" "}
                      El <strong>+</strong> abre la carga en este panel.
                    </>
                  ) : (
                    <> Tu rol es visor: solo lectura.</>
                  )}
                </p>
              </>
            ) : null}

            {panelMode === "create" && canEdit ? (
              <EventForm
                environmentId={environmentId}
                currentUser={user}
                activities={activities}
                onSubmit={handleCreate}
                onCancel={openBrowse}
              />
            ) : null}

            {panelMode === "detail" && selected ? (
              canEdit ? (
                <EventDetail
                  event={selected}
                  items={selectedItems}
                  activities={activities}
                  relatedActivity={relatedActivity}
                  relatedRetos={relatedRetos}
                  onChangeStatus={handleChangeStatus}
                  onChangeActivityStatus={handleChangeActivityStatus}
                  onChangePriority={handleChangePriority}
                  onUpdateTexts={handleUpdateTexts}
                  onUpdateMeta={handleUpdateMeta}
                  onUpdateRelation={
                    selected.type === "reto" ? handleUpdateRelation : undefined
                  }
                  onOpenRelated={openDetail}
                  onAddItem={handleAddItem}
                  onDelete={handleDeleteEvent}
                />
              ) : (
                <p className={styles.panelHint}>
                  Solo lectura. El contenido está en la tarjeta del centro; no
                  podés editar ni agregar avances con el rol de visor.
                </p>
              )
            ) : null}
          </SidePanel>
        </div>
      </div>

      {canEdit ? <AddEventFab onClick={openCreate} /> : null}
    </div>
  );
}
