"use client";

import { useCallback, useEffect, useState } from "react";
import type { EnvironmentRepository } from "@/data/providers/types";
import type {
  EnvironmentInvite,
  EnvironmentMember,
  MemberRole,
  WorkEnvironment,
} from "@/types/environment";
import { canManageMembers } from "@/types/environment";
import styles from "./EnvironmentSharePanel.module.css";

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Propietario",
  editor: "Editor",
  viewer: "Visor",
};

interface EnvironmentSharePanelProps {
  environment: WorkEnvironment;
  userId: string;
  repository: EnvironmentRepository;
  onChanged: () => Promise<void>;
}

export function EnvironmentSharePanel({
  environment,
  userId,
  repository,
  onChanged,
}: EnvironmentSharePanelProps) {
  const isOwner = canManageMembers(environment.my_role);
  const [members, setMembers] = useState<EnvironmentMember[]>([]);
  const [invites, setInvites] = useState<EnvironmentInvite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<MemberRole, "owner">>("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshShare = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextMembers, nextInvites] = await Promise.all([
        repository.listMembers(environment.id),
        isOwner
          ? repository.listPendingInvites(environment.id)
          : Promise.resolve([]),
      ]);
      setMembers(nextMembers);
      setInvites(nextInvites);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los miembros.",
      );
    } finally {
      setLoading(false);
    }
  }, [environment.id, isOwner, repository]);

  useEffect(() => {
    void refreshShare();
  }, [refreshShare]);

  const invite = async () => {
    try {
      setBusy(true);
      setError(null);
      await repository.invite({
        environment_id: environment.id,
        email,
        role,
        invited_by: userId,
      });
      setEmail("");
      await refreshShare();
      await onChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar la invitación.",
      );
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (memberUserId: string) => {
    try {
      setBusy(true);
      setError(null);
      await repository.removeMember(environment.id, memberUserId);
      await refreshShare();
      await onChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo quitar al miembro.",
      );
    } finally {
      setBusy(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      setBusy(true);
      setError(null);
      await repository.revokeInvite(inviteId);
      await refreshShare();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo revocar la invitación.",
      );
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    try {
      setBusy(true);
      setError(null);
      await repository.leave(environment.id, userId);
      await onChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo salir del entorno.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.root} aria-label="Compartir entorno">
      <h3 className={styles.title}>Compartir</h3>
      <p className={styles.hint}>
        Invitá otras cuentas al mismo entorno. Cada una sigue con sus entornos
        personales aparte.
      </p>

      {loading ? <p className={styles.hint}>Cargando miembros…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <ul className={styles.list}>
        {members.map((member) => (
          <li key={member.id} className={styles.row}>
            <div className={styles.person}>
              <span className={styles.name}>
                {member.full_name || member.email || "Usuario"}
              </span>
              <span className={styles.meta}>
                {ROLE_LABEL[member.role]}
                {member.email ? ` · ${member.email}` : ""}
              </span>
            </div>
            {isOwner && member.user_id !== userId && member.role !== "owner" ? (
              <button
                type="button"
                className={styles.ghostBtn}
                disabled={busy}
                onClick={() => void removeMember(member.user_id)}
              >
                Quitar
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <div className={styles.inviteForm}>
          <label className={styles.label} htmlFor={`invite-email-${environment.id}`}>
            Invitar por email
          </label>
          <input
            id={`invite-email-${environment.id}`}
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="cuenta@ejemplo.com"
            disabled={busy}
          />
          <label className={styles.label} htmlFor={`invite-role-${environment.id}`}>
            Rol
          </label>
          <select
            id={`invite-role-${environment.id}`}
            className={styles.select}
            value={role}
            onChange={(event) =>
              setRole(event.target.value as Exclude<MemberRole, "owner">)
            }
            disabled={busy}
          >
            <option value="editor">Editor (puede editar tarjetas)</option>
            <option value="viewer">Visor (solo lectura)</option>
          </select>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={busy || !email.trim()}
            onClick={() => void invite()}
          >
            {busy ? "Enviando…" : "Invitar"}
          </button>
        </div>
      ) : null}

      {isOwner && invites.length > 0 ? (
        <div className={styles.pendingBlock}>
          <h4 className={styles.subtitle}>Invitaciones pendientes</h4>
          <ul className={styles.list}>
            {invites.map((inviteItem) => (
              <li key={inviteItem.id} className={styles.row}>
                <div className={styles.person}>
                  <span className={styles.name}>{inviteItem.email}</span>
                  <span className={styles.meta}>
                    {ROLE_LABEL[inviteItem.role]} · pendiente
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  disabled={busy}
                  onClick={() => void revokeInvite(inviteItem.id)}
                >
                  Revocar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {environment.my_role && environment.my_role !== "owner" ? (
        <button
          type="button"
          className={styles.leaveBtn}
          disabled={busy}
          onClick={() => void leave()}
        >
          Salir del entorno
        </button>
      ) : null}
    </section>
  );
}
