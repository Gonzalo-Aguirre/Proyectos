import { readLocalJson, writeLocalJson } from "@/data/local/storage";
import type {
  CreateEnvironmentInput,
  CreateInviteInput,
  EnvironmentInvite,
  EnvironmentMember,
  MemberRole,
  UpdateEnvironmentInput,
  WorkEnvironment,
} from "@/types/environment";
import type {
  CreateEventInput,
  CreateEventItemInput,
  EventItem,
  EventPriority,
  EventType,
  TeamEvent,
  UpdateEventInput,
} from "@/types/event";
import type {
  EnvironmentRepository,
  EventItemRepository,
  EventRepository,
} from "./types";

interface LocalAccount {
  id: string;
  email: string;
  full_name: string;
}

const MEMBERS_KEY = "environment_members";
const INVITES_KEY = "environment_invites";

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

function sortByDateAsc<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

function normalizeEventType(type: string): EventType {
  if (type === "problema") return "reto";
  if (type === "reto" || type === "actividad") return type;
  return "actividad";
}

function normalizePriority(value: string | null | undefined): EventPriority {
  if (value === "alta" || value === "media" || value === "baja") return value;
  return "media";
}

function normalizeEvent(raw: TeamEvent): TeamEvent {
  return {
    ...raw,
    type: normalizeEventType(raw.type),
    related_activity_id: raw.related_activity_id ?? null,
    priority: normalizePriority(raw.priority),
  };
}

export function createMockEventProvider(): EventRepository {
  const load = () =>
    readLocalJson<TeamEvent[]>("events", []).map(normalizeEvent);
  const save = (events: TeamEvent[]) => writeLocalJson("events", events);
  const loadItems = () => readLocalJson<EventItem[]>("event_items", []);
  const saveItems = (items: EventItem[]) =>
    writeLocalJson("event_items", items);

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
          input.status ?? (input.type === "reto" ? "abierto" : "terminada"),
        priority: input.priority ?? "media",
        status_changed_by: null,
        status_changed_at: null,
        related_activity_id:
          input.type === "reto" ? (input.related_activity_id ?? null) : null,
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
        involved: input.involved ?? current.involved,
        tags: input.tags ?? current.tags,
        priority:
          input.priority !== undefined ? input.priority : current.priority,
        status_changed_by:
          input.status_changed_by === undefined
            ? current.status_changed_by
            : input.status_changed_by,
        status_changed_at:
          input.status_changed_at === undefined
            ? current.status_changed_at
            : input.status_changed_at,
        related_activity_id:
          input.related_activity_id === undefined
            ? current.related_activity_id
            : input.related_activity_id,
      };

      const next = [...events];
      next[index] = updated;
      save(next);
      return updated;
    },

    async remove(id) {
      const remaining = load()
        .filter((event) => event.id !== id)
        .map((event) =>
          event.related_activity_id === id
            ? { ...event, related_activity_id: null }
            : event,
        );
      save(remaining);
      saveItems(loadItems().filter((item) => item.event_id !== id));
    },
  };
}

export function createMockEventItemProvider(): EventItemRepository {
  const load = () => readLocalJson<EventItem[]>("event_items", []);
  const save = (items: EventItem[]) => writeLocalJson("event_items", items);

  return {
    async listByEvent(eventId) {
      return sortByDateAsc(load().filter((item) => item.event_id === eventId));
    },

    async listByEvents(eventIds) {
      if (eventIds.length === 0) return [];
      const idSet = new Set(eventIds);
      return sortByDateAsc(load().filter((item) => idSet.has(item.event_id)));
    },

    async create(input: CreateEventItemInput) {
      const body = input.body.trim();
      if (!body) throw new Error("El avance no puede estar vacío.");

      const created: EventItem = {
        id: createId(),
        event_id: input.event_id,
        body,
        created_at: new Date().toISOString(),
        created_by: input.created_by,
        created_by_user_id: input.created_by_user_id ?? null,
      };
      save([...load(), created]);
      return created;
    },
  };
}

export function createMockEnvironmentProvider(): EnvironmentRepository {
  const load = () => readLocalJson<WorkEnvironment[]>("environments", []);
  const save = (items: WorkEnvironment[]) =>
    writeLocalJson("environments", items);
  const loadMembers = () =>
    readLocalJson<EnvironmentMember[]>(MEMBERS_KEY, []);
  const saveMembers = (items: EnvironmentMember[]) =>
    writeLocalJson(MEMBERS_KEY, items);
  const loadInvites = () =>
    readLocalJson<EnvironmentInvite[]>(INVITES_KEY, []);
  const saveInvites = (items: EnvironmentInvite[]) =>
    writeLocalJson(INVITES_KEY, items);

  const ensureOwnerMembership = (env: WorkEnvironment) => {
    if (!env.created_by_user_id) return;
    const members = loadMembers();
    if (
      members.some(
        (m) =>
          m.environment_id === env.id && m.user_id === env.created_by_user_id,
      )
    ) {
      return;
    }
    members.push({
      id: createId(),
      environment_id: env.id,
      user_id: env.created_by_user_id,
      role: "owner",
      created_at: env.created_at,
    });
    saveMembers(members);
  };

  const enrich = (
    env: WorkEnvironment,
    userId: string,
  ): WorkEnvironment | null => {
    ensureOwnerMembership(env);
    const members = loadMembers().filter((m) => m.environment_id === env.id);
    const mine = members.find((m) => m.user_id === userId);
    if (!mine) return null;
    return {
      ...env,
      my_role: mine.role,
      is_shared: members.length > 1,
    };
  };

  const requireRole = (
    environmentId: string,
    userId: string,
    allowed: MemberRole[],
  ): MemberRole => {
    const env = load().find((item) => item.id === environmentId);
    if (!env) throw new Error("Entorno no encontrado.");
    ensureOwnerMembership(env);
    const member = loadMembers().find(
      (m) => m.environment_id === environmentId && m.user_id === userId,
    );
    if (!member || !allowed.includes(member.role)) {
      throw new Error("No tenés permiso para esta acción.");
    }
    return member.role;
  };

  const profileFor = (userId: string) => {
    const accounts = readLocalJson<LocalAccount[]>("accounts", []);
    return accounts.find((a) => a.id === userId) ?? null;
  };

  return {
    async list(userId) {
      return sortByDateDesc(
        load()
          .map((env) => enrich(env, userId))
          .filter((env): env is WorkEnvironment => env !== null),
      );
    },

    async getById(id, userId) {
      const env = load().find((item) => item.id === id);
      if (!env) return null;
      return enrich(env, userId);
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
        my_role: "owner",
        is_shared: false,
      };
      save([created, ...items]);
      if (created.created_by_user_id) {
        const members = loadMembers();
        members.push({
          id: createId(),
          environment_id: created.id,
          user_id: created.created_by_user_id,
          role: "owner",
          created_at: created.created_at,
        });
        saveMembers(members);
      }
      return created;
    },

    async update(id, input: UpdateEnvironmentInput) {
      const items = load();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`Entorno no encontrado: ${id}`);
      const current = items[index];
      const updated: WorkEnvironment = {
        ...current,
        name: input.name?.trim() ?? current.name,
        description:
          input.description === undefined
            ? current.description
            : input.description.trim(),
      };
      const next = [...items];
      next[index] = updated;
      save(next);
      return updated;
    },

    async remove(id) {
      save(load().filter((item) => item.id !== id));
      saveMembers(loadMembers().filter((m) => m.environment_id !== id));
      saveInvites(loadInvites().filter((i) => i.environment_id !== id));
      const events = readLocalJson<TeamEvent[]>("events", []).map(normalizeEvent);
      const remainingEvents = events.filter(
        (event) => event.environment_id !== id,
      );
      const removedIds = new Set(
        events
          .filter((event) => event.environment_id === id)
          .map((event) => event.id),
      );
      writeLocalJson("events", remainingEvents);
      const items = readLocalJson<EventItem[]>("event_items", []);
      writeLocalJson(
        "event_items",
        items.filter((item) => !removedIds.has(item.event_id)),
      );
    },

    async listMembers(environmentId) {
      return loadMembers()
        .filter((m) => m.environment_id === environmentId)
        .map((m) => {
          const profile = profileFor(m.user_id);
          return {
            ...m,
            full_name: profile?.full_name ?? null,
            email: profile?.email ?? null,
          };
        })
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
    },

    async listPendingInvites(environmentId) {
      return loadInvites()
        .filter(
          (i) => i.environment_id === environmentId && i.status === "pending",
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async listMyPendingInvites(email) {
      const normalized = email.trim().toLowerCase();
      const envs = load();
      return loadInvites()
        .filter(
          (i) =>
            i.status === "pending" && i.email.trim().toLowerCase() === normalized,
        )
        .map((invite) => ({
          ...invite,
          environment_name:
            envs.find((e) => e.id === invite.environment_id)?.name ??
            "Entorno",
        }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async invite(input: CreateInviteInput) {
      requireRole(input.environment_id, input.invited_by, ["owner"]);
      const email = input.email.trim().toLowerCase();
      if (!email.includes("@")) throw new Error("Ingresá un email válido.");

      const accounts = readLocalJson<LocalAccount[]>("accounts", []);
      const existingUser = accounts.find(
        (a) => a.email.trim().toLowerCase() === email,
      );
      if (existingUser) {
        const already = loadMembers().some(
          (m) =>
            m.environment_id === input.environment_id &&
            m.user_id === existingUser.id,
        );
        if (already) throw new Error("Esa cuenta ya es miembro del entorno.");
      }

      const invites = loadInvites();
      const duplicate = invites.find(
        (i) =>
          i.environment_id === input.environment_id &&
          i.email === email &&
          i.status === "pending",
      );
      if (duplicate) throw new Error("Ya hay una invitación pendiente a ese email.");

      const created: EnvironmentInvite = {
        id: createId(),
        environment_id: input.environment_id,
        email,
        role: input.role,
        token: createId(),
        status: "pending",
        invited_by: input.invited_by,
        created_at: new Date().toISOString(),
        expires_at: null,
      };
      saveInvites([created, ...invites]);
      return created;
    },

    async acceptInvite(inviteId, userId) {
      const accounts = readLocalJson<LocalAccount[]>("accounts", []);
      const account = accounts.find((a) => a.id === userId);
      if (!account) throw new Error("Sesión inválida.");

      const invites = loadInvites();
      const index = invites.findIndex((i) => i.id === inviteId);
      if (index === -1) throw new Error("Invitación no encontrada.");
      const invite = invites[index];
      if (invite.status !== "pending") {
        throw new Error("La invitación ya no está pendiente.");
      }
      if (invite.email !== account.email.trim().toLowerCase()) {
        throw new Error("Esta invitación es para otro email.");
      }

      const members = loadMembers();
      const existing = members.find(
        (m) =>
          m.environment_id === invite.environment_id && m.user_id === userId,
      );
      if (existing) {
        existing.role = invite.role;
      } else {
        members.push({
          id: createId(),
          environment_id: invite.environment_id,
          user_id: userId,
          role: invite.role,
          created_at: new Date().toISOString(),
        });
      }
      saveMembers(members);

      const next = [...invites];
      next[index] = { ...invite, status: "accepted" };
      saveInvites(next);
    },

    async revokeInvite(inviteId) {
      const invites = loadInvites();
      const index = invites.findIndex((i) => i.id === inviteId);
      if (index === -1) throw new Error("Invitación no encontrada.");
      const next = [...invites];
      next[index] = { ...next[index], status: "revoked" };
      saveInvites(next);
    },

    async removeMember(environmentId, userId) {
      const members = loadMembers().filter(
        (m) => m.environment_id === environmentId,
      );
      const target = members.find((m) => m.user_id === userId);
      if (!target) throw new Error("Miembro no encontrado.");
      if (target.role === "owner") {
        const owners = members.filter((m) => m.role === "owner");
        if (owners.length <= 1) {
          throw new Error("No podés quitar al único propietario.");
        }
      }
      saveMembers(
        loadMembers().filter(
          (m) => !(m.environment_id === environmentId && m.user_id === userId),
        ),
      );
    },

    async leave(environmentId, userId) {
      const members = loadMembers().filter(
        (m) => m.environment_id === environmentId,
      );
      const mine = members.find((m) => m.user_id === userId);
      if (!mine) throw new Error("No sos miembro de este entorno.");
      if (mine.role === "owner") {
        throw new Error(
          "El propietario no puede salir. Eliminá el entorno o transferí el rol antes.",
        );
      }
      saveMembers(
        loadMembers().filter(
          (m) => !(m.environment_id === environmentId && m.user_id === userId),
        ),
      );
    },
  };
}
