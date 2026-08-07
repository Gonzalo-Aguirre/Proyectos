"use client";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { EnvironmentsHub } from "@/features/environments/EnvironmentsHub";

export default function EntornosPage() {
  return (
    <RequireAuth>
      <EnvironmentsHub />
    </RequireAuth>
  );
}
