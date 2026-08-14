import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  TextRun,
  type IBorderOptions,
} from "docx";
import { formatEventDate } from "@/lib/date/format";
import { isHashTag, resolveTagHref } from "@/lib/tags/tag-kind";
import type { EventItem, EventPriority, TeamEvent } from "@/types/event";

const COLOR = {
  completeBg: "DCFCE7",
  completeText: "166534",
  pendingBg: "FEF3C7",
  pendingText: "92400E",
  openBg: "FEE2E2",
  openText: "991B1B",
  resolvedBg: "DCFCE7",
  resolvedText: "166534",
  pageBg: "E0F2FE",
  pageText: "075985",
  muted: "64748B",
  title: "0F172A",
  border: "CBD5E1",
  accent: "0F766E",
  link: "0563C1",
  /** Fondo gris más marcado para descripciones */
  descBg: "E5E7EB",
  /** Fondo gris más claro para avances */
  followUpBg: "F3F4F6",
};

const PRIORITY_RANK: Record<EventPriority, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

const PRIORITY_LABEL: Record<EventPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const thinBorder: IBorderOptions = {
  style: BorderStyle.SINGLE,
  size: 8,
  color: COLOR.border,
};

const blockBorder: IBorderOptions = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: COLOR.border,
};

const separatorBorder: IBorderOptions = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "D1D5DB",
};

export interface WordReportInput {
  bitacoraTitle: string;
  environmentName: string;
  generatedAt: Date;
  /** Eventos visibles (respetan filtro/búsqueda). */
  visibleEvents: TeamEvent[];
  /** Todos los eventos del entorno (para resolver actividades padre). */
  allEvents: TeamEvent[];
  itemsByEvent: Map<string, EventItem[]>;
  filterLabel?: string;
}

function isActivityDone(event: TeamEvent): boolean {
  return event.type === "actividad" && event.status === "terminada";
}

function isRetoResolved(event: TeamEvent): boolean {
  return event.type === "reto" && event.status === "resuelto";
}

function statusBadge(event: TeamEvent): { label: string; bg: string; fg: string } {
  if (event.type === "actividad") {
    if (event.status === "terminada") {
      return { label: "COMPLETA", bg: COLOR.completeBg, fg: COLOR.completeText };
    }
    if (event.status === "en_progreso") {
      return { label: "EN PROGRESO", bg: COLOR.pendingBg, fg: COLOR.pendingText };
    }
    return { label: "POR INICIAR", bg: COLOR.pendingBg, fg: COLOR.pendingText };
  }
  if (event.status === "resuelto") {
    return { label: "RESUELTO", bg: COLOR.resolvedBg, fg: COLOR.resolvedText };
  }
  return { label: "ABIERTO", bg: COLOR.openBg, fg: COLOR.openText };
}

function pageTags(event: TeamEvent): string[] {
  return event.tags.filter((tag) => !isHashTag(tag) && tag.trim());
}

function hashTags(event: TeamEvent): string[] {
  return event.tags.filter((tag) => isHashTag(tag));
}

function sortRetos(retos: TeamEvent[]): TeamEvent[] {
  return [...retos].sort((a, b) => {
    const aDone = isRetoResolved(a) ? 1 : 0;
    const bDone = isRetoResolved(b) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (p !== 0) return p;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function sortActivities(activities: TeamEvent[]): TeamEvent[] {
  return [...activities].sort((a, b) => {
    const aDone = isActivityDone(a) ? 1 : 0;
    const bDone = isActivityDone(b) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function p(
  text: string,
  opts?: {
    bold?: boolean;
    color?: string;
    size?: number;
    italics?: boolean;
    spacingAfter?: number;
    spacingBefore?: number;
  },
): Paragraph {
  return new Paragraph({
    spacing: {
      after: opts?.spacingAfter ?? 80,
      before: opts?.spacingBefore ?? 0,
    },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        italics: opts?.italics,
        color: opts?.color ?? COLOR.title,
        size: opts?.size ?? 20,
        font: "Calibri",
      }),
    ],
  });
}

function badgeLine(event: TeamEvent, kind: "ACTIVIDAD" | "RETO"): Paragraph {
  const badge = statusBadge(event);
  return new Paragraph({
    spacing: { after: 120, before: 60 },
    shading: { type: ShadingType.CLEAR, fill: badge.bg },
    border: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
    },
    children: [
      new TextRun({
        text: ` ${kind} · ${badge.label} · Prioridad ${PRIORITY_LABEL[event.priority]} `,
        bold: true,
        color: badge.fg,
        size: 18,
        font: "Calibri",
      }),
    ],
  });
}

function titleLine(event: TeamEvent, level: "activity" | "reto"): Paragraph {
  const badge = statusBadge(event);
  const kind = level === "activity" ? "ACTIVIDAD" : "RETO";
  return new Paragraph({
    spacing: {
      before: level === "activity" ? 240 : 160,
      after: 80,
    },
    children: [
      new TextRun({
        text: `${kind}: ${event.title}`,
        bold: true,
        color: badge.fg,
        size: level === "activity" ? 30 : 26,
        font: "Calibri",
      }),
    ],
  });
}

function sectionEndLine(): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    border: {
      bottom: separatorBorder,
    },
    children: [new TextRun({ text: "", size: 4 })],
  });
}

function metaLine(event: TeamEvent): Paragraph {
  const parts = [
    `Creado: ${formatEventDate(event.created_at)}`,
    `Por: ${event.created_by}`,
  ];
  if (event.status_changed_at) {
    parts.push(`Estado actualizado: ${formatEventDate(event.status_changed_at)}`);
  }
  return p(parts.join("  ·  "), {
    color: COLOR.muted,
    size: 16,
    spacingAfter: 60,
  });
}

function pagesBlock(event: TeamEvent): Paragraph[] {
  const pages = pageTags(event);
  if (pages.length === 0) return [];

  const out: Paragraph[] = [
    new Paragraph({
      spacing: { before: 80, after: 40 },
      shading: { type: ShadingType.CLEAR, fill: COLOR.pageBg },
      children: [
        new TextRun({
          text: " 📁 UBICACIÓN DE ARCHIVOS (páginas)",
          bold: true,
          color: COLOR.pageText,
          size: 18,
          font: "Calibri",
        }),
      ],
    }),
  ];

  for (const page of pages) {
    const href = resolveTagHref(page) ?? page.trim();
    out.push(
      new Paragraph({
        spacing: { after: 40 },
        shading: { type: ShadingType.CLEAR, fill: COLOR.pageBg },
        children: [
          new TextRun({
            text: "  → ",
            color: COLOR.pageText,
            size: 18,
            font: "Calibri",
          }),
          new ExternalHyperlink({
            link: href,
            children: [
              new TextRun({
                text: href,
                color: COLOR.link,
                size: 18,
                font: "Calibri",
                underline: {},
              }),
            ],
          }),
        ],
      }),
    );
  }
  return out;
}

function multilineParagraphs(
  text: string,
  opts?: {
    bold?: boolean;
    color?: string;
    size?: number;
    italics?: boolean;
    spacingAfter?: number;
    spacingBefore?: number;
    indent?: number;
    prefix?: string;
    fill?: string;
    withBlockBorder?: boolean;
  },
): Paragraph[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.length === 0) lines.push("");

  return lines.map((line, index) => {
    const isFirst = index === 0;
    const isLast = index === lines.length - 1;
    const content =
      isFirst && opts?.prefix ? `${opts.prefix}${line}` : line || " ";
    return new Paragraph({
      spacing: {
        before: isFirst ? (opts?.spacingBefore ?? 0) : 0,
        after: isLast ? (opts?.spacingAfter ?? 80) : 16,
      },
      indent: opts?.indent ? { left: opts.indent } : undefined,
      shading: opts?.fill
        ? { type: ShadingType.CLEAR, fill: opts.fill }
        : undefined,
      border: opts?.withBlockBorder
        ? {
            top: isFirst
              ? blockBorder
              : { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: isLast
              ? blockBorder
              : { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: blockBorder,
            right: blockBorder,
          }
        : undefined,
      children: [
        new TextRun({
          text: content,
          bold: opts?.bold,
          italics: opts?.italics,
          color: opts?.color ?? COLOR.title,
          size: opts?.size ?? 20,
          font: "Calibri",
        }),
      ],
    });
  });
}

function followUpShade(
  text: string,
  opts: {
    bold?: boolean;
    size?: number;
    italics?: boolean;
    isFirst: boolean;
    isLast: boolean;
    indent?: number;
  },
): Paragraph {
  return new Paragraph({
    spacing: {
      before: opts.isFirst ? 60 : 0,
      after: opts.isLast ? 80 : 12,
    },
    indent: opts.indent ? { left: opts.indent } : undefined,
    shading: { type: ShadingType.CLEAR, fill: COLOR.followUpBg },
    border: {
      top: opts.isFirst
        ? blockBorder
        : { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: opts.isLast
        ? blockBorder
        : { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: blockBorder,
      right: blockBorder,
    },
    children: [
      new TextRun({
        text: text || " ",
        bold: opts.bold,
        italics: opts.italics,
        color: opts.italics ? COLOR.muted : COLOR.title,
        size: opts.size ?? 18,
        font: "Calibri",
      }),
    ],
  });
}

function followUpsBlock(
  event: TeamEvent,
  itemsByEvent: Map<string, EventItem[]>,
): Paragraph[] {
  const items = [...(itemsByEvent.get(event.id) ?? [])].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  if (items.length === 0) {
    return [
      followUpShade("  Seguimiento: sin avances registrados.", {
        italics: true,
        size: 18,
        isFirst: true,
        isLast: true,
      }),
    ];
  }

  const rows: { text: string; bold?: boolean; size?: number; indent?: number }[] =
    [{ text: "  Seguimiento / avances", bold: true, size: 18 }];

  for (const item of items) {
    rows.push({
      text: `  • ${formatEventDate(item.created_at)} — ${item.created_by}:`,
      bold: true,
      size: 17,
    });
    const bodyLines = (item.body.trim() || "(sin texto)")
      .replace(/\r\n/g, "\n")
      .split("\n");
    for (const line of bodyLines) {
      rows.push({ text: `  ${line || " "}`, size: 18, indent: 160 });
    }
  }

  return rows.map((row, index) =>
    followUpShade(row.text, {
      bold: row.bold,
      size: row.size,
      indent: row.indent,
      isFirst: index === 0,
      isLast: index === rows.length - 1,
    }),
  );
}

function eventBody(
  event: TeamEvent,
  itemsByEvent: Map<string, EventItem[]>,
  kind: "ACTIVIDAD" | "RETO",
): Paragraph[] {
  const description = event.description?.trim() || "Sin descripción.";
  const paragraphs: Paragraph[] = [
    titleLine(event, kind === "ACTIVIDAD" ? "activity" : "reto"),
    badgeLine(event, kind),
    metaLine(event),
    p("Descripción", { bold: true, size: 18, spacingBefore: 60, spacingAfter: 40 }),
    ...multilineParagraphs(description, {
      size: 24,
      fill: COLOR.descBg,
      withBlockBorder: true,
      spacingBefore: 0,
      spacingAfter: 100,
    }),
  ];

  if (event.resolution?.trim()) {
    paragraphs.push(
      p("Resolución / cierre", {
        bold: true,
        size: 18,
        spacingBefore: 40,
        spacingAfter: 40,
      }),
      ...multilineParagraphs(event.resolution.trim(), {
        size: 24,
        fill: COLOR.descBg,
        withBlockBorder: true,
        spacingAfter: 100,
      }),
    );
  }

  paragraphs.push(...pagesBlock(event));

  const tags = hashTags(event);
  if (tags.length > 0) {
    paragraphs.push(
      p(`Etiquetas: ${tags.join(" · ")}`, {
        color: COLOR.muted,
        size: 16,
        spacingBefore: 40,
      }),
    );
  }

  if (event.involved.length > 0) {
    paragraphs.push(
      p(`Involucrados: ${event.involved.join(", ")}`, {
        color: COLOR.muted,
        size: 16,
      }),
    );
  }

  paragraphs.push(...followUpsBlock(event, itemsByEvent));
  paragraphs.push(sectionEndLine());
  return paragraphs;
}

/**
 * - Actividades visibles → sección + sus retos.
 * - Si la actividad está visible: incluye todos los retos de esa actividad (macro).
 * - Si solo hay retos visibles (filtro de retos): agrupa bajo su actividad padre.
 * - Retos sin related_activity_id → RETOS SIN ACTIVIDAD.
 */
export function buildReportModel(input: WordReportInput): {
  activities: { activity: TeamEvent; retos: TeamEvent[] }[];
  orphanRetos: TeamEvent[];
} {
  const byId = new Map(input.allEvents.map((e) => [e.id, e]));
  const visibleIds = new Set(input.visibleEvents.map((e) => e.id));
  const visibleActivities = input.visibleEvents.filter(
    (e) => e.type === "actividad",
  );
  const visibleRetos = input.visibleEvents.filter((e) => e.type === "reto");
  const activityOnlyFilter =
    visibleActivities.length > 0 && visibleRetos.length === 0;
  const hasVisibleActivities = visibleActivities.length > 0;

  const activityMap = new Map<string, { activity: TeamEvent; retos: TeamEvent[] }>();

  const ensureActivity = (activity: TeamEvent) => {
    if (!activityMap.has(activity.id)) {
      activityMap.set(activity.id, { activity, retos: [] });
    }
    return activityMap.get(activity.id)!;
  };

  for (const activity of visibleActivities) {
    ensureActivity(activity);
  }

  for (const reto of visibleRetos) {
    if (!reto.related_activity_id) continue;
    const parent = byId.get(reto.related_activity_id);
    if (!parent || parent.type !== "actividad") continue;
    const bucket = ensureActivity(parent);
    if (!bucket.retos.some((r) => r.id === reto.id)) {
      bucket.retos.push(reto);
    }
  }

  // Macro: si la actividad está en la vista, listar todos sus retos del entorno.
  // (Si el filtro es solo retos, no expandimos: ya están los retos visibles.)
  if (hasVisibleActivities && !activityOnlyFilter) {
    // "todos" u otros casos mixtos: igual expandimos retos de actividades visibles
  }
  if (hasVisibleActivities) {
    for (const activity of visibleActivities) {
      const bucket = ensureActivity(activity);
      for (const event of input.allEvents) {
        if (
          event.type === "reto" &&
          event.related_activity_id === activity.id &&
          !bucket.retos.some((r) => r.id === event.id)
        ) {
          // Con filtro de retos no hay actividades visibles, así que no entra acá.
          // Con filtro actividades o todos: sí incluimos el macro completo.
          if (activityOnlyFilter || visibleIds.has(activity.id)) {
            bucket.retos.push(event);
          }
        }
      }
    }
  }

  const orphanRetos = sortRetos(
    visibleRetos.filter((event) => {
      if (!event.related_activity_id) return true;
      const parent = byId.get(event.related_activity_id);
      return !parent || parent.type !== "actividad";
    }),
  );

  // Evitar duplicar en huérfanos los retos ya listados bajo una actividad
  const listedRetoIds = new Set(
    [...activityMap.values()].flatMap((b) => b.retos.map((r) => r.id)),
  );
  const orphansFiltered = orphanRetos.filter((r) => !listedRetoIds.has(r.id));

  const activities = sortActivities(
    [...activityMap.values()].map((b) => b.activity),
  ).map((activity) => ({
    activity,
    retos: sortRetos(activityMap.get(activity.id)?.retos ?? []),
  }));

  return { activities, orphanRetos: orphansFiltered };
}

export async function buildWordReportBlob(
  input: WordReportInput,
): Promise<Blob> {
  const { activities, orphanRetos } = buildReportModel(input);
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: input.bitacoraTitle,
          bold: true,
          color: COLOR.accent,
          size: 36,
          font: "Calibri",
        }),
      ],
    }),
    p(`Entorno: ${input.environmentName}`, { bold: true, size: 22 }),
    p(
      `Informe generado: ${formatEventDate(input.generatedAt.toISOString())}`,
      { color: COLOR.muted, size: 16 },
    ),
  );

  if (input.filterLabel) {
    children.push(
      p(`Vista aplicada: ${input.filterLabel}`, {
        color: COLOR.muted,
        size: 16,
        italics: true,
      }),
    );
  }

  children.push(
    p(
      "Leyenda: verde = completo/resuelto · ámbar = en curso/por iniciar · rojo = reto abierto. Las páginas (links sin #) indican dónde están los archivos.",
      { color: COLOR.muted, size: 15, spacingAfter: 200, spacingBefore: 80 },
    ),
  );

  if (activities.length === 0 && orphanRetos.length === 0) {
    children.push(
      p("No hay actividades ni retos para exportar con el filtro actual.", {
        italics: true,
        color: COLOR.muted,
      }),
    );
  }

  let activityIndex = 0;
  for (const { activity, retos } of activities) {
    activityIndex += 1;
    children.push(
      p(`──────── Actividad ${activityIndex} de ${activities.length} ────────`, {
        color: COLOR.muted,
        size: 16,
        spacingBefore: 200,
        spacingAfter: 40,
      }),
    );
    children.push(...eventBody(activity, input.itemsByEvent, "ACTIVIDAD"));

    if (retos.length === 0) {
      children.push(
        p("Retos vinculados: ninguno.", {
          italics: true,
          color: COLOR.muted,
          spacingBefore: 80,
        }),
      );
    } else {
      const openCount = retos.filter((r) => !isRetoResolved(r)).length;
      const doneCount = retos.length - openCount;
      children.push(
        p(
          `Retos de esta actividad: ${retos.length} (abiertos: ${openCount} · resueltos: ${doneCount}) — orden: abiertos primero, luego por prioridad.`,
          {
            bold: true,
            size: 18,
            spacingBefore: 120,
            spacingAfter: 80,
            color: COLOR.accent,
          },
        ),
      );
      for (const reto of retos) {
        children.push(...eventBody(reto, input.itemsByEvent, "RETO"));
      }
    }
  }

  if (orphanRetos.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [
          new TextRun({
            text: "RETOS SIN ACTIVIDAD",
            bold: true,
            color: COLOR.openText,
            size: 30,
            font: "Calibri",
          }),
        ],
      }),
      p(
        "Retos que no están vinculados a una actividad. Orden: abiertos primero, luego por prioridad.",
        { color: COLOR.muted, size: 16, spacingAfter: 120 },
      ),
    );
    for (const reto of orphanRetos) {
      children.push(...eventBody(reto, input.itemsByEvent, "RETO"));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function filterLabelFromState(
  filter: string,
  query: string,
): string | undefined {
  const parts: string[] = [];
  if (filter && filter !== "todos") {
    const map: Record<string, string> = {
      actividades: "Solo actividades",
      retos_abiertos: "Solo retos abiertos",
      retos_resueltos: "Solo retos resueltos",
    };
    parts.push(map[filter] ?? filter);
  }
  if (query.trim()) parts.push(`Búsqueda: “${query.trim()}”`);
  return parts.length ? parts.join(" · ") : undefined;
}
