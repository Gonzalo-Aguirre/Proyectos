"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/features/modal/ModalShell";
import type {
  ActivityStatus,
  ChangeStatusInput,
  TeamEvent,
} from "@/types/event";
import { EventDetail } from "./EventDetail";

interface EventDetailModalProps {
  event: TeamEvent | null;
  open: boolean;
  onClose: () => void;
  onChangeStatus?: (input: ChangeStatusInput) => Promise<void>;
  onChangeActivityStatus?: (status: ActivityStatus) => Promise<void>;
}

export function EventDetailModal({
  event,
  open,
  onClose,
  onChangeStatus,
  onChangeActivityStatus,
}: EventDetailModalProps) {
  /** Conserva el último evento para no desmontar el modal de golpe al cerrar. */
  const [visibleEvent, setVisibleEvent] = useState<TeamEvent | null>(event);

  useEffect(() => {
    if (event) setVisibleEvent(event);
  }, [event]);

  return (
    <ModalShell
      title={visibleEvent?.title ?? "Detalle"}
      open={open && Boolean(visibleEvent)}
      onClose={onClose}
    >
      {visibleEvent ? (
        <EventDetail
          event={visibleEvent}
          onChangeStatus={onChangeStatus}
          onChangeActivityStatus={onChangeActivityStatus}
        />
      ) : null}
    </ModalShell>
  );
}
