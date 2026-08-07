import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase lazy.
 * No se instancia si el provider activo es mock.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    throw new Error(
      "Supabase no está configurado. Completá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY, o usá NEXT_PUBLIC_DATA_PROVIDER=mock.",
    );
  }

  client = createClient(url, anonKey);
  return client;
}
