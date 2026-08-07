"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getActiveDataProvider,
  getAuthRepository,
} from "@/data/providers";
import type { SignInEmailInput, SignUpInput } from "@/data/providers/types";
import type { UserProfile } from "@/types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  provider: "mock" | "supabase";
  signInWithGoogle: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInWithEmail: (input: SignInEmailInput) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => getAuthRepository(), []);
  const provider = getActiveDataProvider();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const session = await auth.getSession();
      setUser(session);
    } catch {
      setUser(null);
    }
  }, [auth]);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const session = await auth.getSession();
        if (alive) setUser(session);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const unsubscribe = auth.onAuthStateChange?.((profile) => {
      if (!alive) return;
      setUser(profile);
      setLoading(false);
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      provider,
      signInWithGoogle: async () => {
        await auth.signInWithGoogle();
      },
      signUp: async (input) => {
        const profile = await auth.signUp(input);
        setUser(profile);
      },
      signInWithEmail: async (input) => {
        const profile = await auth.signInWithEmail(input);
        setUser(profile);
      },
      signOut: async () => {
        await auth.signOut();
        setUser(null);
      },
      refresh,
    }),
    [auth, loading, provider, refresh, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
