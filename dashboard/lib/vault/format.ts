import { differenceInCalendarDays, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

// Coerce a frontmatter date value into an ISO date string (YYYY-MM-DD).
// YAML may hand us a Date object (unquoted dates), a string, or junk.
export function toISODate(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) {
    return isValid(value) ? value.toISOString().slice(0, 10) : undefined;
  }
  const str = String(value).trim();
  if (!str) return undefined;
  // Accept full ISO timestamps and plain dates alike.
  const parsed = parseISO(str);
  if (isValid(parsed)) return parsed.toISOString().slice(0, 10);
  const fallback = new Date(str);
  return isValid(fallback) ? fallback.toISOString().slice(0, 10) : undefined;
}

export function daysBetween(a: string | undefined, b: Date): number | undefined {
  if (!a) return undefined;
  const parsed = parseISO(a);
  if (!isValid(parsed)) return undefined;
  return differenceInCalendarDays(b, parsed);
}

export function relativeDate(iso: string | undefined): string {
  if (!iso) return "";
  const parsed = parseISO(iso);
  if (!isValid(parsed)) return iso;
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const parsed = parseISO(iso);
  if (!isValid(parsed)) return iso;
  return parsed.toISOString().slice(0, 10);
}
