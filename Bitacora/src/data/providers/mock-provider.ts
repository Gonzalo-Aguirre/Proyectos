import { readLocalJson, writeLocalJson } from "@/data/local/storage";
import type {
  CreateEnvironmentInput,
  WorkEnvironment,
} from "@/types/environment";
import type {
  CreateEventInput,
  TeamEvent,
  UpdateEventInput,
} from "@/types/event";
import type { EnvironmentRepository, EventRepository } from "./types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortByDateDesc<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function createMockEventProvider(): EventRepository {
  const load = () => readLocalJson<TeamEvent[]>("events", []);
  const save = (events: TeamEvent[]) => writeLocalJson("events", events);

  return {
    async listByEnvironment(environmentId) {
      return sortByDateDesc(
        load().filter((event) => event.environment_id === environmentId),
      );
    },

    async listAll() {
      return sortByDateDesc(load());
    },

    async getById(id) {
      return load().find((event) => event.id === id) ?? null;
    },

    async create(input: CreateEventInput) {
      const events = load();
      const created: TeamEvent = {
        id: createId(),
        environment_id: input.environment_id,
        created_at: new Date().toISOString(),
        created_by: input.created_by,
        created_by_user_id: input.created_by_user_id ?? null,
        type: input.type,
        title: input.title.trim(),
        description: input.description.trim(),
        resolution: input.resolution?.trim() || null,
        involved: input.involved ?? [],
        tags: input.tags ?? [],
        status:
          input.status ??
          (input.type === "problema" ? "abierto" : "terminada"),
        status_changed_by: null,
        status_changed_at: null,
      };
      save([created, ...events]);
      return created;
    },

    async update(id, input: UpdateEventInput) {
      const events = load();
      const index = events.findIndex((event) => event.id === id);
      if (index === -1) throw new Error(`Evento no encontrado: ${id}`);

      const current = events[index];
      const updated: TeamEvent = {
        ...current,
        ...input,
        title: input.title?.trim() ?? current.title,
        description: input.description?.trim() ?? current.description,
        resolution:
          input.resolution === undefined
            ? current.resolution
            : input.resolution?.trim() || null,
        status_changed_by:
          input.status_changed_by === undefined
            ? current.status_changed_by
            : input.status_changed_by,
        status_changed_at:
          input.status_changed_at === undefined
            ? current.status_changed_at
            : input.status_changed_at,
      };

      const next = [...events];
      next[index] = updated;
      save(next);
      return updated;
    },

    async remove(id) {
      save(load().filter((event) => event.id !== id));
    },
  };
}

export function createMockEnvironmentProvider(): EnvironmentRepository {
  const load = () => readLocalJson<WorkEnvironment[]>("environments", []);
  const save = (items: WorkEnvironment[]) =>
    writeLocalJson("environments", items);

  return {
    async list() {
      return sortByDateDesc(load());
    },

    async getById(id) {
      return load().find((item) => item.id === id) ?? null;
    },

    async create(input: CreateEnvironmentInput) {
      const items = load();
      const created: WorkEnvironment = {
        id: createId(),
        created_at: new Date().toISOString(),
        name: input.name.trim(),
        description: input.description?.trim() || "",
        created_by: input.created_by,
        created_by_user_id: input.created_by_user_id ?? null,
      };
      save([created, ...items]);
      return created;
    },

    async remove(id) {
      save(load().filter((item) => item.id !== id));
      const events = readLocalJson<TeamEvent[]>("events", []);
      writeLocalJson(
        "events",
        events.filter((event) => event.environment_id !== id),
      );
    },
  };
}
