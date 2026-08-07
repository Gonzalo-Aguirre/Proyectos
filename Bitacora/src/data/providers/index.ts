import { createMockAuthProvider } from "./mock-auth";
import {
  createMockEnvironmentProvider,
  createMockEventProvider,
} from "./mock-provider";
import { createSupabaseAuthProvider } from "./supabase-auth";
import {
  createSupabaseEnvironmentProvider,
  createSupabaseEventProvider,
} from "./supabase-provider";
import type {
  AuthRepository,
  DataProviderName,
  EnvironmentRepository,
  EventRepository,
} from "./types";

let events: EventRepository | null = null;
let environments: EnvironmentRepository | null = null;
let auth: AuthRepository | null = null;

function resolveProviderName(): DataProviderName {
  const value = (process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock").toLowerCase();
  return value === "supabase" ? "supabase" : "mock";
}

export function getActiveDataProvider(): DataProviderName {
  return resolveProviderName();
}

export function getEventRepository(): EventRepository {
  if (events) return events;
  events =
    resolveProviderName() === "supabase"
      ? createSupabaseEventProvider()
      : createMockEventProvider();
  return events;
}

export function getEnvironmentRepository(): EnvironmentRepository {
  if (environments) return environments;
  environments =
    resolveProviderName() === "supabase"
      ? createSupabaseEnvironmentProvider()
      : createMockEnvironmentProvider();
  return environments;
}

export function getAuthRepository(): AuthRepository {
  if (auth) return auth;
  auth =
    resolveProviderName() === "supabase"
      ? createSupabaseAuthProvider()
      : createMockAuthProvider();
  return auth;
}

export type {
  AuthRepository,
  DataProviderName,
  EnvironmentRepository,
  EventRepository,
};
