import {
  readLocalJson,
  removeLocalKey,
  writeLocalJson,
} from "@/data/local/storage";
import type { UserProfile } from "@/types/auth";
import type { AuthRepository, SignInEmailInput, SignUpInput } from "./types";

const SESSION_KEY = "session";
const ACCOUNTS_KEY = "accounts";

interface LocalAccount {
  id: string;
  email: string;
  full_name: string;
  password: string;
  created_at: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toProfile(account: LocalAccount): UserProfile {
  return {
    id: account.id,
    email: account.email,
    full_name: account.full_name,
    avatar_url: null,
    created_at: account.created_at,
  };
}

function loadAccounts(): LocalAccount[] {
  return readLocalJson<LocalAccount[]>(ACCOUNTS_KEY, []);
}

function saveAccounts(accounts: LocalAccount[]): void {
  writeLocalJson(ACCOUNTS_KEY, accounts);
}

export function createMockAuthProvider(): AuthRepository {
  return {
    async getSession() {
      return readLocalJson<UserProfile | null>(SESSION_KEY, null);
    },

    async signInWithGoogle() {
      throw new Error(
        "Google Auth requiere Supabase. Creá una cuenta con email o conectá Supabase.",
      );
    },

    async signUp(input: SignUpInput) {
      const email = normalizeEmail(input.email);
      const fullName = input.full_name.trim();
      const password = input.password;

      if (!fullName) throw new Error("Ingresá tu nombre.");
      if (!email.includes("@")) throw new Error("Ingresá un email válido.");
      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }

      const accounts = loadAccounts();
      if (accounts.some((account) => account.email === email)) {
        throw new Error("Ya existe una cuenta con ese email. Iniciá sesión.");
      }

      const created: LocalAccount = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `local-${Date.now()}`,
        email,
        full_name: fullName,
        password,
        created_at: new Date().toISOString(),
      };

      saveAccounts([created, ...accounts]);
      const profile = toProfile(created);
      writeLocalJson(SESSION_KEY, profile);
      return profile;
    },

    async signInWithEmail(input: SignInEmailInput) {
      const email = normalizeEmail(input.email);
      const account = loadAccounts().find((item) => item.email === email);
      if (!account || account.password !== input.password) {
        throw new Error("Email o contraseña incorrectos.");
      }
      const profile = toProfile(account);
      writeLocalJson(SESSION_KEY, profile);
      return profile;
    },

    async signOut() {
      removeLocalKey(SESSION_KEY);
    },
  };
}
