"use client";

import { ModalShell } from "@/features/modal/ModalShell";
import type { UserProfile } from "@/types/auth";
import type { CreateEventInput, TeamEvent } from "@/types/event";
import { EventForm } from "./EventForm";

interface EventFormModalProps {
  open: boolean;
  environmentId: string;
  currentUser: UserProfile;
  activities: TeamEvent[];
  onClose: () => void;
  onSubmit: (input: CreateEventInput) => Promise<void>;
}

export function EventFormModal({
  open,
  environmentId,
  currentUser,
  activities,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  return (
    <ModalShell title="Nuevo evento" open={open} onClose={onClose}>
      <EventForm
        environmentId={environmentId}
        currentUser={currentUser}
        activities={activities}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </ModalShell>
  );
}
