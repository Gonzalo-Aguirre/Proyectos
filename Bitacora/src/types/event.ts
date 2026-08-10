export type EventType = "actividad" | "reto";

export type ActivityStatus = "por_iniciar" | "en_progreso" | "terminada";

export type RetoStatus = "abierto" | "resuelto";

export type EventPriority = "alta" | "media" | "baja";

/** @deprecated Preferí RetoStatus */
export type ProblemStatus = RetoStatus;

export type EventStatus = ActivityStatus | RetoStatus;

export type TimelineFilter =
  | "todos"
  | "actividades"
  | "retos_abiertos"
  | "retos_resueltos";

export interface TeamEvent {
  id: string;
  environment_id: string;
  created_at: string;
  created_by: string;
  created_by_user_id: string | null;
  type: EventType;
  title: string;
  description: string;
  resolution: string | null;
  involved: string[];
  tags: string[];
  status: EventStatus;
  priority: EventPriority;
  status_changed_by: string | null;
  status_changed_at: string | null;
  /** Solo en retos: actividad del mismo entorno a la que se vincula. */
  related_activity_id: string | null;
}

export interface CreateEventInput {
  environment_id: string;
  created_by: string;
  created_by_user_id?: string | null;
  type: EventType;
  title: string;
  description: string;
  resolution?: string | null;
  involved?: string[];
  tags?: string[];
  status?: EventStatus;
  priority?: EventPriority;
  related_activity_id?: string | null;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  resolution?: string | null;
  involved?: string[];
  tags?: string[];
  status?: EventStatus;
  priority?: EventPriority;
  status_changed_by?: string | null;
  status_changed_at?: string | null;
  related_activity_id?: string | null;
}

export interface ChangeStatusInput {
  status: RetoStatus;
  changed_by: string;
  resolution?: string | null;
}

/** Avance / nota de seguimiento dentro de un evento (append-only). */
export interface EventItem {
  id: string;
  event_id: string;
  body: string;
  created_at: string;
  created_by: string;
  created_by_user_id: string | null;
}

export interface CreateEventItemInput {
  event_id: string;
  body: string;
  created_by: string;
  created_by_user_id?: string | null;
}

export const ACTIVITY_STATUS_OPTIONS: {
  id: ActivityStatus;
  label: string;
}[] = [
  { id: "por_iniciar", label: "Por iniciar" },
  { id: "en_progreso", label: "En progreso" },
  { id: "terminada", label: "Terminada" },
];

export const EVENT_PRIORITY_OPTIONS: {
  id: EventPriority;
  label: string;
}[] = [
  { id: "alta", label: "Alta" },
  { id: "media", label: "Media" },
  { id: "baja", label: "Baja" },
];
