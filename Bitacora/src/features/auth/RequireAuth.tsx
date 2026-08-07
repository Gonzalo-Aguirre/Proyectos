"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectTo } from "@/lib/navigation/redirect";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      redirectTo("/login", (path) => router.replace(path));
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="appShell">
        <p>Cargando sesión…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="appShell">
        <p>Redirigiendo al login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
