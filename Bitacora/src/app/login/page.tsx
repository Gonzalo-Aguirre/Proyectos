"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { useAuth } from "@/features/auth/AuthProvider";
import { redirectTo } from "@/lib/navigation/redirect";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      redirectTo("/entornos", (path) => router.replace(path));
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="appShell">
        <p>Cargando…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="appShell">
        <p>Entrando a entornos…</p>
      </div>
    );
  }

  return <LoginScreen />;
}
