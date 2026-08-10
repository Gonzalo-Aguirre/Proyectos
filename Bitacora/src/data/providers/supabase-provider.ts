import { getSupabaseClient } from "@/lib/supabase/client";
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

export function createSupabaseEventProvider(): EventRepository {
  const supabase = getSupabaseClient();

  return {
    async listByEnvironment(environmentId) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("environment_id", environmentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as TeamEvent[]).map(normalizeEvent);
    },

    async listAll() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as TeamEvent[]).map(normalizeEvent);
    },

    async getById(id) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeEvent(data as TeamEvent) : null;
    },

    async create(input: CreateEventInput) {
      const payload = {
        environment_id: input.environment_id,
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
          (input.type === "reto" ? "abierto" : "terminada"),
        priority: input.priority ?? "media",
        related_activity_id:
          input.type === "reto" ? (input.related_activity_id ?? null) : null,
      };

      const { data, error } = await supabase
        .from("events")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return normalizeEvent(data as TeamEvent);
    },

    async update(id, input: UpdateEventInput) {
      const payload: Record<string, unknown> = {};
      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.description !== undefined) {
        payload.description = input.description.trim();
      }
      if (input.resolution !== undefined) {
        payload.resolution = input.resolution?.trim() || null;
      }
      if (input.involved !== undefined) payload.involved = input.involved;
      if (input.tags !== undefined) payload.tags = input.tags;
      if (input.status !== undefined) payload.status = input.status;
      if (input.priority !== undefined) payload.priority = input.priority;
      if (input.status_changed_by !== undefined) {
        payload.status_changed_by = input.status_changed_by;
      }
      if (input.status_changed_at !== undefined) {
        payload.status_changed_at = input.status_changed_at;
      }
      if (input.related_activity_id !== undefined) {
        payload.related_activity_id = input.related_activity_id;
      }

      const { data, error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return normalizeEvent(data as TeamEvent);
    },

    async remove(id) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export function createSupabaseEventItemProvider(): EventItemRepository {
  const supabase = getSupabaseClient();

  return {
    async listByEvent(eventId) {
      const { data, error } = await supabase
        .from("event_items")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventItem[];
    },

    async listByEvents(eventIds) {
      if (eventIds.length === 0) return [];
      const { data, error } = await supabase
        .from("event_items")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventItem[];
    },

    async create(input: CreateEventItemInput) {
      const body = input.body.trim();
      if (!body) throw new Error("El avance no puede estar vacío.");

      const { data, error } = await supabase
        .from("event_items")
        .insert({
          event_id: input.event_id,
          body,
          created_by: input.created_by,
          created_by_user_id: input.created_by_user_id ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as EventItem;
    },
  };
}

export function createSupabaseEnvironmentProvider(): EnvironmentRepository {
  const supabase = getSupabaseClient();

  async function enrichEnvironments(
    envs: WorkEnvironment[],
    userId: string,
  ): Promise<WorkEnvironment[]> {
    if (envs.length === 0) return [];
    const ids = envs.map((env) => env.id);
    const { data: members, error } = await supabase
      .from("environment_members")
      .select("environment_id, user_id, role")
      .in("environment_id", ids);
    if (error) throw error;

    const byEnv = new Map<
      string,
      { myRole: MemberRole | null; count: number }
    >();
    for (const member of members ?? []) {
      const current = byEnv.get(member.environment_id) ?? {
        myRole: null,
        count: 0,
      };
      current.count += 1;
      if (member.user_id === userId) {
        current.myRole = member.role as MemberRole;
      }
      byEnv.set(member.environment_id, current);
    }

    const enriched: WorkEnvironment[] = [];
    for (const env of envs) {
      const info = byEnv.get(env.id);
      if (!info?.myRole) continue;
      enriched.push({
        ...env,
        my_role: info.myRole,
        is_shared: info.count > 1,
      });
    }
    return enriched;
  }

  return {
    async list(userId) {
      const { data, error } = await supabase
        .from("environments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return enrichEnvironments((data ?? []) as WorkEnvironment[], userId);
    },

    async getById(id, userId) {
      const { data, error } = await supabase
        .from("environments")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const [enriched] = await enrichEnvironments(
        [data as WorkEnvironment],
        userId,
      );
      return enriched ?? null;
    },

    async create(input: CreateEnvironmentInput) {
      const { data, error } = await supabase
        .from("environments")
        .insert({
          name: input.name.trim(),
          description: input.description?.trim() || "",
          created_by: input.created_by,
          created_by_user_id: input.created_by_user_id ?? null,
        })
        .select("*")
        .single();
      if (error) {
        throw new Error(
          error.message || "No se pudo crear el entorno (Supabase).",
        );
      }

      const created = data as WorkEnvironment;
      if (created.created_by_user_id) {
        const { error: memberError } = await supabase
          .from("environment_members")
          .upsert(
            {
              environment_id: created.id,
              user_id: created.created_by_user_id,
              role: "owner",
            },
            { onConflict: "environment_id,user_id" },
          );
        if (memberError) {
          // El trigger suele crear el owner; si falla el upsert, igual devolvemos el entorno.
          console.warn("No se pudo asegurar membership owner:", memberError.message);
        }
      }

      return {
        ...created,
        my_role: "owner" as const,
        is_shared: false,
      };
    },

    async update(id, input: UpdateEnvironmentInput) {
      const payload: Record<string, string> = {};
      if (input.name !== undefined) payload.name = input.name.trim();
      if (input.description !== undefined) {
        payload.description = input.description.trim();
      }
      const { data, error } = await supabase
        .from("environments")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as WorkEnvironment;
    },

    async remove(id) {
      const { error } = await supabase
        .from("environments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },

    async listMembers(environmentId) {
      const { data, error } = await supabase
        .from("environment_members")
        .select("id, environment_id, user_id, role, created_at, profiles(full_name, email)")
        .eq("environment_id", environmentId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      return (data ?? []).map((row) => {
        const profile = Array.isArray(row.profiles)
          ? row.profiles[0]
          : row.profiles;
        return {
          id: row.id as string,
          environment_id: row.environment_id as string,
          user_id: row.user_id as string,
          role: row.role as MemberRole,
          created_at: row.created_at as string,
          full_name: (profile as { full_name?: string } | null)?.full_name ?? null,
          email: (profile as { email?: string } | null)?.email ?? null,
        } satisfies EnvironmentMember;
      });
    },

    async listPendingInvites(environmentId) {
      const { data, error } = await supabase
        .from("environment_invites")
        .select("*")
        .eq("environment_id", environmentId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EnvironmentInvite[];
    },

    async listMyPendingInvites(email) {
      const normalized = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from("environment_invites")
        .select("*, environments(name)")
        .eq("status", "pending")
        .ilike("email", normalized)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row) => {
        const env = Array.isArray(row.environments)
          ? row.environments[0]
          : row.environments;
        return {
          id: row.id as string,
          environment_id: row.environment_id as string,
          email: row.email as string,
          role: row.role as MemberRole,
          token: row.token as string,
          status: row.status as EnvironmentInvite["status"],
          invited_by: row.invited_by as string,
          created_at: row.created_at as string,
          expires_at: (row.expires_at as string | null) ?? null,
          environment_name:
            (env as { name?: string } | null)?.name ?? "Entorno",
        } satisfies EnvironmentInvite;
      });
    },

    async invite(input: CreateInviteInput) {
      const email = input.email.trim().toLowerCase();
      if (!email.includes("@")) throw new Error("Ingresá un email válido.");

      const token =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `invite-${Date.now()}`;

      const { data, error } = await supabase
        .from("environment_invites")
        .insert({
          environment_id: input.environment_id,
          email,
          role: input.role,
          token,
          status: "pending",
          invited_by: input.invited_by,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as EnvironmentInvite;
    },

    async acceptInvite(inviteId, _userId) {
      void _userId;
      const { error } = await supabase.rpc("accept_environment_invite", {
        invite_id: inviteId,
      });
      if (error) throw error;
    },

    async revokeInvite(inviteId) {
      const { error } = await supabase
        .from("environment_invites")
        .update({ status: "revoked" })
        .eq("id", inviteId);
      if (error) throw error;
    },

    async removeMember(environmentId, userId) {
      const { error } = await supabase
        .from("environment_members")
        .delete()
        .eq("environment_id", environmentId)
        .eq("user_id", userId);
      if (error) throw error;
    },

    async leave(environmentId, userId) {
      const { data: mine, error: roleError } = await supabase
        .from("environment_members")
        .select("role")
        .eq("environment_id", environmentId)
        .eq("user_id", userId)
        .maybeSingle();
      if (roleError) throw roleError;
      if (!mine) throw new Error("No sos miembro de este entorno.");
      if (mine.role === "owner") {
        throw new Error(
          "El propietario no puede salir. Eliminá el entorno o transferí el rol antes.",
        );
      }
      const { error } = await supabase
        .from("environment_members")
        .delete()
        .eq("environment_id", environmentId)
        .eq("user_id", userId);
      if (error) throw error;
    },
  };
}
