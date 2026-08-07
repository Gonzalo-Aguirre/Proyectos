import type { CreateEventInput } from "@/types/event";

export interface EventValidationResult {
  ok: boolean;
  errors: {
    title?: string;
    description?: string;
    created_by?: string;
  };
}

export function validateCreateEvent(
  input: CreateEventInput,
): EventValidationResult {
  const errors: EventValidationResult["errors"] = {};

  if (!input.environment_id?.trim()) {
    errors.created_by = "Falta el entorno del evento.";
  }

  if (!input.created_by?.trim()) {
    errors.created_by = "Falta el usuario que carga el evento.";
  }

  if (!input.title?.trim()) {
    errors.title = "El título es obligatorio.";
  }

  if (!input.description?.trim()) {
    errors.description = "La descripción es obligatoria.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
