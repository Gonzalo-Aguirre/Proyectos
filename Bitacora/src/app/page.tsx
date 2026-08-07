"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { redirectTo } from "@/lib/navigation/redirect";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
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

  // Sin sesión: login acá mismo (evita quedarse en “Redirigiendo…”)
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="appShell">
      <p>Entrando a entornos…</p>
    </div>
  );
}
