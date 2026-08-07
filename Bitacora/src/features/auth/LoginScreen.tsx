"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectTo } from "@/lib/navigation/redirect";
import { useAuth } from "./AuthProvider";
import styles from "./LoginScreen.module.css";

type AuthMode = "login" | "signup";

export function LoginScreen() {
  const router = useRouter();
  const { provider, signInWithGoogle, signUp, signInWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const goEntornos = () => {
    redirectTo("/entornos", (path) => router.replace(path));
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      // Con Supabase OAuth navega solo; con mock lanza error claro.
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar con Google.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp({
          full_name: fullName,
          email,
          password,
        });
      } else {
        await signInWithEmail({ email, password });
      }
      goEntornos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo completar el acceso.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Bitácora del Equipo</h1>
        <p className={styles.lead}>
          Creá tu cuenta o entrá con Google para cargar actividades por entorno.
        </p>

        <button
          type="button"
          className={styles.google}
          onClick={() => void handleGoogle()}
          disabled={busy}
        >
          Continuar con Google
        </button>

        <p className={styles.hint}>
          {provider === "supabase"
            ? "Google crea tu perfil automáticamente."
            : "Google se activa al conectar Supabase. Por ahora usá crear cuenta / iniciar sesión."}
        </p>

        <div className={styles.divider}>o con email</div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={mode === "login" ? styles.tabActive : styles.tab}
            onClick={() => setMode("login")}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={mode === "signup" ? styles.tabActive : styles.tab}
            onClick={() => setMode("signup")}
          >
            Crear cuenta
          </button>
        </div>

        <form className="stackSm" onSubmit={(e) => void handleSubmit(e)}>
          {mode === "signup" ? (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="full-name">
                Nombre
              </label>
              <input
                id="full-name"
                className={styles.input}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                required
              />
            </div>
          ) : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              minLength={6}
              required
            />
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy
              ? "Esperá…"
              : mode === "signup"
                ? "Crear cuenta"
                : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
