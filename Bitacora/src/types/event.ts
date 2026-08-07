export type EventType = "actividad" | "problema";

export type ActivityStatus = "por_iniciar" | "en_progreso" | "terminada";

export type ProblemStatus = "abierto" | "resuelto";

export type EventStatus = ActivityStatus | ProblemStatus;

export type TimelineFilter =
  | "todos"
  | "actividades"
  | "problemas_abiertos"
  | "problemas_resueltos";

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
  status_changed_by: string | null;
  status_changed_at: string | null;
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
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  resolution?: string | null;
  involved?: string[];
  tags?: string[];
  status?: EventStatus;
  status_changed_by?: string | null;
  status_changed_at?: string | null;
}

export interface ChangeStatusInput {
  status: ProblemStatus;
  changed_by: string;
  resolution?: string | null;
}

export const ACTIVITY_STATUS_OPTIONS: {
  id: ActivityStatus;
  label: string;
}[] = [
  { id: "por_iniciar", label: "Por iniciar" },
  { id: "en_progreso", label: "En progreso" },
  { id: "terminada", label: "Terminada" },
];
