/** Tag con # = etiqueta normal. Sin # = dirección web. */
export function isHashTag(value: string): boolean {
  return value.trim().startsWith("#");
}

export function resolveTagHref(value: string): string | null {
  if (isHashTag(value)) return null;
  const raw = value.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function displayTagLabel(value: string): string {
  const trimmed = value.trim();
  if (isHashTag(trimmed)) return trimmed;
  try {
    const href = resolveTagHref(trimmed);
    if (!href) return trimmed;
    const url = new URL(href);
    const path = `${url.host}${url.pathname}`.replace(/\/$/, "");
    return path.length > 36 ? `${path.slice(0, 33)}…` : path;
  } catch {
    return trimmed.length > 36 ? `${trimmed.slice(0, 33)}…` : trimmed;
  }
}
