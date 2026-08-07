import type { UserProfile } from "@/types/auth";
import type {
  CreateEnvironmentInput,
  WorkEnvironment,
} from "@/types/environment";
import type {
  CreateEventInput,
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

export interface EnvironmentRepository {
  list(): Promise<WorkEnvironment[]>;
  getById(id: string): Promise<WorkEnvironment | null>;
  create(input: CreateEnvironmentInput): Promise<WorkEnvironment>;
  remove(id: string): Promise<void>;
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
