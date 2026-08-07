"use client";

import { use } from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { BitacoraApp } from "@/features/bitacora/BitacoraApp";

interface EnvironmentPageProps {
  params: Promise<{ envId: string }>;
}

export default function EnvironmentBitacoraPage({
  params,
}: EnvironmentPageProps) {
  const { envId } = use(params);

  return (
    <RequireAuth>
      <BitacoraApp environmentId={envId} />
    </RequireAuth>
  );
}
