import { getSupabaseClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/auth";
import type { AuthRepository, SignInEmailInput, SignUpInput } from "./types";

async function ensureProfile(user: {
  id: string;
  email?: string | null;
  created_at: string;
  user_metadata?: Record<string, unknown>;
}): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Usuario";

  const profile: UserProfile = {
    id: user.id,
    email: user.email ?? "",
    full_name: fullName,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    created_at: user.created_at,
  };

  await supabase.from("profiles").upsert({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  });

  return profile;
}

async function profileFromSession(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile as UserProfile;
  return ensureProfile(user);
}

export function createSupabaseAuthProvider(): AuthRepository {
  return {
    async getSession() {
      return profileFromSession();
    },

    async signInWithGoogle() {
      const supabase = getSupabaseClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/entornos`,
        },
      });
      if (error) throw error;
    },

    async signUp(input: SignUpInput) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: {
            full_name: input.full_name.trim(),
            name: input.full_name.trim(),
          },
        },
      });
      if (error) throw error;
      if (!data.user) {
        throw new Error("No se pudo crear la cuenta. Revisá el email.");
      }

      // Si Supabase pide confirmar email, puede no haber session todavía.
      if (!data.session) {
        throw new Error(
          "Cuenta creada. Si pedimos confirmación por email, revisá tu bandeja e iniciá sesión.",
        );
      }

      return ensureProfile(data.user);
    },

    async signInWithEmail(input: SignInEmailInput) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("No se pudo iniciar sesión.");
      return ensureProfile(data.user);
    },

    async signOut() {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    onAuthStateChange(callback) {
      const supabase = getSupabaseClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        void profileFromSession().then(callback);
      });
      return () => subscription.unsubscribe();
    },
  };
}
