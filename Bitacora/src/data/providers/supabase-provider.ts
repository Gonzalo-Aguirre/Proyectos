import { getSupabaseClient } from "@/lib/supabase/client";
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
      return (data ?? []) as TeamEvent[];
    },

    async listAll() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TeamEvent[];
    },

    async getById(id) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as TeamEvent | null) ?? null;
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
          (input.type === "problema" ? "abierto" : "terminada"),
      };

      const { data, error } = await supabase
        .from("events")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as TeamEvent;
    },

    async update(id, input: UpdateEventInput) {
      const { data, error } = await supabase
        .from("events")
        .update(input)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as TeamEvent;
    },

    async remove(id) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export function createSupabaseEnvironmentProvider(): EnvironmentRepository {
  const supabase = getSupabaseClient();

  return {
    async list() {
      const { data, error } = await supabase
        .from("environments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WorkEnvironment[];
    },

    async getById(id) {
      const { data, error } = await supabase
        .from("environments")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as WorkEnvironment | null) ?? null;
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
  };
}
