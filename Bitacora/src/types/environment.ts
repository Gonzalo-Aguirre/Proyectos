export type MemberRole = "owner" | "editor" | "viewer";

export type InviteStatus = "pending" | "accepted" | "revoked";

export const DEFAULT_BITACORA_TITLE = "Bitácora del Equipo";

export interface WorkEnvironment {
  id: string;
  name: string;
  description: string;
  /** Título de la bitácora en el header (editable). */
  bitacora_title: string;
  created_by: string;
  created_by_user_id: string | null;
  created_at: string;
  /** Rol del usuario actual en este entorno (si se listó en contexto auth). */
  my_role?: MemberRole | null;
  /** True si hay más de un miembro. */
  is_shared?: boolean;
}

export interface CreateEnvironmentInput {
  name: string;
  description?: string;
  bitacora_title?: string;
  created_by: string;
  created_by_user_id?: string | null;
}

export interface UpdateEnvironmentInput {
  name?: string;
  description?: string;
  bitacora_title?: string;
}

export interface EnvironmentMember {
  id: string;
  environment_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  /** Datos de perfil si están disponibles. */
  full_name?: string | null;
  email?: string | null;
}

export interface EnvironmentInvite {
  id: string;
  environment_id: string;
  email: string;
  role: MemberRole;
  token: string;
  status: InviteStatus;
  invited_by: string;
  created_at: string;
  expires_at: string | null;
  environment_name?: string;
}

export interface CreateInviteInput {
  environment_id: string;
  email: string;
  role: Exclude<MemberRole, "owner">;
  invited_by: string;
}

export function resolveBitacoraTitle(
  title: string | null | undefined,
): string {
  const trimmed = title?.trim();
  return trimmed || DEFAULT_BITACORA_TITLE;
}

export function canEditEnvironment(role: MemberRole | null | undefined): boolean {
  return role === "owner" || role === "editor";
}

export function canManageMembers(role: MemberRole | null | undefined): boolean {
  return role === "owner";
}
