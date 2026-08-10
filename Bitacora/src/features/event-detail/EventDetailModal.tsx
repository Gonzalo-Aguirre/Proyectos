"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/features/modal/ModalShell";
import type {
  ActivityStatus,
  ChangeStatusInput,
  EventItem,
  EventPriority,
  TeamEvent,
} from "@/types/event";
import { EventDetail } from "./EventDetail";

interface EventDetailModalProps {
  event: TeamEvent | null;
  open: boolean;
  items?: EventItem[];
  activities?: TeamEvent[];
  relatedActivity?: TeamEvent | null;
  relatedRetos?: TeamEvent[];
  onClose: () => void;
  onChangeStatus?: (input: ChangeStatusInput) => Promise<void>;
  onChangeActivityStatus?: (status: ActivityStatus) => Promise<void>;
  onChangePriority?: (priority: EventPriority) => Promise<void>;
  onUpdateTexts?: (input: {
    title: string;
    description: string;
  }) => Promise<void>;
  onUpdateMeta?: (input: {
    involved: string[];
    tags: string[];
  }) => Promise<void>;
  onUpdateRelation?: (relatedActivityId: string | null) => Promise<void>;
  onOpenRelated?: (event: TeamEvent) => void;
  onAddItem?: (body: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function EventDetailModal({
  event,
  open,
  items = [],
  activities = [],
  relatedActivity = null,
  relatedRetos = [],
  onClose,
  onChangeStatus,
  onChangeActivityStatus,
  onChangePriority,
  onUpdateTexts,
  onUpdateMeta,
  onUpdateRelation,
  onOpenRelated,
  onAddItem,
  onDelete,
}: EventDetailModalProps) {
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
          items={items}
          activities={activities}
          relatedActivity={relatedActivity}
          relatedRetos={relatedRetos}
          onChangeStatus={onChangeStatus}
          onChangeActivityStatus={onChangeActivityStatus}
          onChangePriority={onChangePriority}
          onUpdateTexts={onUpdateTexts}
          onUpdateMeta={onUpdateMeta}
          onUpdateRelation={onUpdateRelation}
          onOpenRelated={onOpenRelated}
          onAddItem={onAddItem}
          onDelete={onDelete}
        />
      ) : null}
    </ModalShell>
  );
}
