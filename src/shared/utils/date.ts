import type { PartialDate } from '../../core/db/schema';

export function partialDateToNumber(date?: PartialDate): number {
  if (!date) return 0;
  const y = date.year ?? 0;
  const m = date.month ?? 0;
  const d = date.day ?? 0;
  return y * 10000 + m * 100 + d;
}

export function comparePartialDates(a?: PartialDate, b?: PartialDate): number {
  const na = partialDateToNumber(a);
  const nb = partialDateToNumber(b);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

export function isValidPartialDate(date?: PartialDate): boolean {
  if (!date) return true;
  if (typeof date.year !== 'number' || !Number.isFinite(date.year)) return false;
  if (date.month !== undefined && (date.month < 1 || date.month > 12)) return false;
  if (date.day !== undefined && (date.day < 1 || date.day > 31)) return false;
  if (date.qualifier && !['circa', 'before', 'after'].includes(date.qualifier)) return false;
  return true;
}

export function partialDateToString(date?: PartialDate): string {
  if (!date) return '';
  const parts: string[] = [String(date.year)];
  if (date.month) parts.push(String(date.month).padStart(2, '0'));
  if (date.day) parts.push(String(date.day).padStart(2, '0'));
  let s = parts.join('-');
  if (date.qualifier === 'circa') s = `c. ${s}`;
  if (date.qualifier === 'before') s = `before ${s}`;
  if (date.qualifier === 'after') s = `after ${s}`;
  if (date.rangeEnd) s = `${s} – ${partialDateToString(date.rangeEnd)}`;
  return s;
}

export function partialDatesOverlap(a?: PartialDate, b?: PartialDate): boolean {
  // Simple year-level overlap check
  if (!a || !b) return false;
  const aStart = a.year;
  const aEnd = a.rangeEnd?.year ?? a.year;
  const bStart = b.year;
  const bEnd = b.rangeEnd?.year ?? b.year;
  return aStart <= bEnd && bStart <= aEnd;
}