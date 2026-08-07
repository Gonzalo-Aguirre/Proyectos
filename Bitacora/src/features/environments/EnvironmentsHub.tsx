"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getEnvironmentRepository } from "@/data/providers";
import { useAuth } from "@/features/auth/AuthProvider";
import { CsvExportButton } from "@/features/export/CsvExportButton";
import { redirectTo } from "@/lib/navigation/redirect";
import type {
  CreateEnvironmentInput,
  WorkEnvironment,
} from "@/types/environment";
import { CreateEnvironmentForm } from "./CreateEnvironmentForm";
import { EnvironmentCard } from "./EnvironmentCard";
import styles from "./EnvironmentsHub.module.css";

export function EnvironmentsHub() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const repository = useMemo(() => getEnvironmentRepository(), []);
  const [items, setItems] = useState<WorkEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setItems(await repository.list());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los entornos.",
      );
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async (input: CreateEnvironmentInput) => {
    await repository.create(input);
    await refresh();
  };

  if (!user) return null;

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Entornos</h1>
          <p className={styles.lead}>
            Elegí o creá el lugar / contexto donde cargás actividades. Cada
            entorno tiene su propia bitácora.
          </p>
        </div>
        <div className={styles.userBox}>
          <span className={styles.userName}>{user.full_name}</span>
          <button
            type="button"
            className={styles.signOut}
            onClick={() => {
              void signOut().then(() => {
                redirectTo("/login", (path) => router.replace(path));
              });
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <CreateEnvironmentForm
        createdBy={user.full_name}
        createdByUserId={user.id}
        onSubmit={handleCreate}
      />

      {loading ? <p>Cargando entornos…</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <div className={styles.empty}>
          Todavía no hay entornos. Creá el primero arriba.
        </div>
      ) : null}

      <div className={styles.grid}>
        {items.map((environment) => (
          <EnvironmentCard
            key={environment.id}
            environment={environment}
            onOpen={(item) => router.push(`/entornos/${item.id}`)}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <CsvExportButton />
      </div>
    </div>
  );
}
