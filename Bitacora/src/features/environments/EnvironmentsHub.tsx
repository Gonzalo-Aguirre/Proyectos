"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getEnvironmentRepository } from "@/data/providers";
import { useAuth } from "@/features/auth/AuthProvider";
import { CsvExportButton } from "@/features/export/CsvExportButton";
import { DangerAction } from "@/features/workspace/DangerAction";
import { SidePanel } from "@/features/workspace/SidePanel";
import { redirectTo } from "@/lib/navigation/redirect";
import type {
  CreateEnvironmentInput,
  EnvironmentInvite,
  UpdateEnvironmentInput,
  WorkEnvironment,
} from "@/types/environment";
import { canManageMembers } from "@/types/environment";
import { ThemeSelector } from "@/features/theme/ThemeSelector";
import { CreateEnvironmentForm } from "./CreateEnvironmentForm";
import { EnvironmentCard } from "./EnvironmentCard";
import { EnvironmentSharePanel } from "./EnvironmentSharePanel";
import styles from "./EnvironmentsHub.module.css";

export function EnvironmentsHub() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const repository = useMemo(() => getEnvironmentRepository(), []);
  const [items, setItems] = useState<WorkEnvironment[]>([]);
  const [pendingInvites, setPendingInvites] = useState<EnvironmentInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<"browse" | "create" | "detail">(
    "browse",
  );
  const [selected, setSelected] = useState<WorkEnvironment | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [envs, invites] = await Promise.all([
        repository.list(user.id),
        repository.listMyPendingInvites(user.email),
      ]);
      setItems(envs);
      setPendingInvites(invites);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los entornos.",
      );
    } finally {
      setLoading(false);
    }
  }, [repository, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selected) return;
    const fresh = items.find((item) => item.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
    if (!fresh && panelMode === "detail") {
      setSelected(null);
      setPanelMode("browse");
    }
  }, [items, selected, panelMode]);

  const handleCreate = async (input: CreateEnvironmentInput) => {
    const created = await repository.create(input);
    await refresh();
    setSelected(created);
    setPanelMode("detail");
    setEditing(false);
  };

  const openBrowse = () => {
    setSelected(null);
    setEditing(false);
    setPanelMode("browse");
  };

  const openDetail = (environment: WorkEnvironment) => {
    setSelected(environment);
    setEditName(environment.name);
    setEditDescription(environment.description);
    setEditing(false);
    setEditError(null);
    setPanelMode("detail");
  };

  const saveTexts = async () => {
    if (!selected) return;
    if (!editName.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }
    try {
      setSaving(true);
      setEditError(null);
      const input: UpdateEnvironmentInput = {
        name: editName.trim(),
        description: editDescription.trim(),
      };
      const updated = await repository.update(selected.id, input);
      setSelected(updated);
      setEditing(false);
      await refresh();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "No se pudo guardar el entorno.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    await repository.remove(selected.id);
    setSelected(null);
    setPanelMode("browse");
    await refresh();
  };

  const acceptInvite = async (inviteId: string) => {
    if (!user) return;
    try {
      setInviteBusy(true);
      setError(null);
      await repository.acceptInvite(inviteId, user.id);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo aceptar la invitación.",
      );
    } finally {
      setInviteBusy(false);
    }
  };

  if (!user) return null;

  const isOwner = selected ? canManageMembers(selected.my_role) : false;

  const panelTitle =
    panelMode === "create"
      ? "Nuevo entorno"
      : panelMode === "detail"
        ? selected?.name ?? "Entorno"
        : "Acciones";

  return (
    <div className={styles.workspace}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Entornos</h1>
          <p className={styles.lead}>
            Elegí o creá el lugar / contexto donde cargás actividades. Cada
            entorno tiene su propia bitácora. Podés compartir un entorno con
            otras cuentas sin mezclar historiales.
          </p>
        </div>
        <div className={styles.userBox}>
          <ThemeSelector />
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

      {pendingInvites.length > 0 ? (
        <div className={styles.invitesBanner} role="region" aria-label="Invitaciones">
          <p className={styles.invitesTitle}>Invitaciones pendientes</p>
          <ul className={styles.invitesList}>
            {pendingInvites.map((invite) => (
              <li key={invite.id} className={styles.inviteRow}>
                <span>
                  <strong>{invite.environment_name ?? "Entorno"}</strong>
                  {" · "}
                  {invite.role === "viewer" ? "Visor" : "Editor"}
                </span>
                <button
                  type="button"
                  className={styles.acceptBtn}
                  disabled={inviteBusy}
                  onClick={() => void acceptInvite(invite.id)}
                >
                  Aceptar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.columns}>
        <section className={styles.gridPane} aria-label="Grilla de entornos">
          {loading ? <p className={styles.status}>Cargando entornos…</p> : null}
          {error ? (
            <p className={styles.status} role="alert">
              {error}
            </p>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <div className={styles.empty}>
              Todavía no hay entornos. Creá el primero desde el panel o aceptá
              una invitación.
            </div>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <div className={styles.grid}>
              {items.map((environment) => (
                <div key={environment.id} className={styles.cell}>
                  <EnvironmentCard
                    environment={environment}
                    selected={selected?.id === environment.id}
                    onSelect={openDetail}
                    onOpen={(item) => router.push(`/entornos/${item.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className={styles.panelPane}>
          <SidePanel
            title={panelTitle}
            onClose={panelMode === "browse" ? undefined : openBrowse}
          >
            {panelMode === "browse" ? (
              <>
                <p className={styles.panelHint}>
                  Clic para seleccionar (editar / compartir / eliminar). Doble
                  clic o “Abrir bitácora” para entrar.
                </p>
                <button
                  type="button"
                  className={styles.createBtn}
                  onClick={() => setPanelMode("create")}
                >
                  Nuevo entorno
                </button>
                <div className={styles.panelFooter}>
                  <CsvExportButton userId={user.id} />
                </div>
              </>
            ) : null}

            {panelMode === "create" ? (
              <CreateEnvironmentForm
                createdBy={user.full_name}
                createdByUserId={user.id}
                onSubmit={handleCreate}
              />
            ) : null}

            {panelMode === "detail" && selected ? (
              <>
                <button
                  type="button"
                  className={styles.createBtn}
                  onClick={() => router.push(`/entornos/${selected.id}`)}
                >
                  Abrir bitácora
                </button>

                {selected.is_shared || selected.my_role === "viewer" ? (
                  <p className={styles.panelHint}>
                    {selected.my_role === "viewer"
                      ? "Tu rol: visor (solo lectura)."
                      : selected.my_role === "editor"
                        ? "Tu rol: editor."
                        : "Entorno compartido."}
                  </p>
                ) : null}

                {isOwner ? (
                  <div className={styles.envEdit}>
                    <div className={styles.envEditHeader}>
                      <h3 className={styles.envEditTitle}>Textos</h3>
                      {!editing ? (
                        <button
                          type="button"
                          className={styles.envEditBtn}
                          onClick={() => {
                            setEditName(selected.name);
                            setEditDescription(selected.description);
                            setEditError(null);
                            setEditing(true);
                          }}
                        >
                          Editar
                        </button>
                      ) : null}
                    </div>

                    {!editing ? (
                      <p className={styles.panelHint}>
                        {selected.description || "Sin descripción."}
                      </p>
                    ) : (
                      <div className={styles.envEditForm}>
                        <label className={styles.envLabel} htmlFor="env-edit-name">
                          Nombre
                        </label>
                        <input
                          id="env-edit-name"
                          className={styles.envInput}
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                        />
                        <label
                          className={styles.envLabel}
                          htmlFor="env-edit-description"
                        >
                          Descripción
                        </label>
                        <textarea
                          id="env-edit-description"
                          className={styles.envTextarea}
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          rows={3}
                        />
                        {editError ? (
                          <p className={styles.envError}>{editError}</p>
                        ) : null}
                        <div className={styles.envActions}>
                          <button
                            type="button"
                            className={styles.envCancel}
                            disabled={saving}
                            onClick={() => setEditing(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className={styles.envSave}
                            disabled={saving}
                            onClick={() => void saveTexts()}
                          >
                            {saving ? "Guardando…" : "Guardar"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={styles.panelHint}>
                    {selected.description || "Sin descripción."}
                  </p>
                )}

                <EnvironmentSharePanel
                  environment={selected}
                  userId={user.id}
                  repository={repository}
                  onChanged={async () => {
                    await refresh();
                  }}
                />

                {isOwner ? (
                  <DangerAction
                    label="Eliminar entorno"
                    hint="Borra el entorno y todas sus tarjetas para todos los miembros."
                    onConfirm={handleDelete}
                  />
                ) : null}
              </>
            ) : null}
          </SidePanel>
        </div>
      </div>
    </div>
  );
}
