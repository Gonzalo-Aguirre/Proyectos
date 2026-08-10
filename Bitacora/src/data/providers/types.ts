import type { UserProfile } from "@/types/auth";
import type {
  CreateEnvironmentInput,
  CreateInviteInput,
  EnvironmentInvite,
  EnvironmentMember,
  UpdateEnvironmentInput,
  WorkEnvironment,
} from "@/types/environment";
import type {
  CreateEventInput,
  CreateEventItemInput,
  EventItem,
  TeamEvent,
  UpdateEventInput,
} from "@/types/event";

export interface EventRepository {
  listByEnvironment(environmentId: string): Promise<TeamEvent[]>;
  listAll(): Promise<TeamEvent[]>;
  getById(id: string): Promise<TeamEvent | null>;
  create(input: CreateEventInput): Promise<TeamEvent>;
  update(id: string, input: UpdateEventInput): Promise<TeamEvent>;
  remove(id: string): Promise<void>;
}

export interface EventItemRepository {
  listByEvent(eventId: string): Promise<EventItem[]>;
  listByEvents(eventIds: string[]): Promise<EventItem[]>;
  create(input: CreateEventItemInput): Promise<EventItem>;
}

export interface EnvironmentRepository {
  list(userId: string): Promise<WorkEnvironment[]>;
  getById(id: string, userId: string): Promise<WorkEnvironment | null>;
  create(input: CreateEnvironmentInput): Promise<WorkEnvironment>;
  update(id: string, input: UpdateEnvironmentInput): Promise<WorkEnvironment>;
  remove(id: string): Promise<void>;
  listMembers(environmentId: string): Promise<EnvironmentMember[]>;
  listPendingInvites(environmentId: string): Promise<EnvironmentInvite[]>;
  listMyPendingInvites(email: string): Promise<EnvironmentInvite[]>;
  invite(input: CreateInviteInput): Promise<EnvironmentInvite>;
  acceptInvite(inviteId: string, userId: string): Promise<void>;
  revokeInvite(inviteId: string): Promise<void>;
  removeMember(environmentId: string, userId: string): Promise<void>;
  leave(environmentId: string, userId: string): Promise<void>;
}

export interface SignUpInput {
  full_name: string;
  email: string;
  password: string;
}

export interface SignInEmailInput {
  email: string;
  password: string;
}

export interface AuthRepository {
  getSession(): Promise<UserProfile | null>;
  signInWithGoogle(): Promise<void>;
  signUp(input: SignUpInput): Promise<UserProfile>;
  signInWithEmail(input: SignInEmailInput): Promise<UserProfile>;
  signOut(): Promise<void>;
  onAuthStateChange?(
    callback: (profile: UserProfile | null) => void,
  ): () => void;
}

export type DataProviderName = "mock" | "supabase";
