/**
 * Formats a Date representing a locally-picked calendar day (from a
 * Calendar/DatePicker widget, or `new Date()`) as "YYYY-MM-DD" using the
 * viewer's own local time — NOT Period.convertDateFromISO, which
 * re-interprets the Date in the org's timezone and can shift the calendar
 * day by ±1 for a viewer elsewhere. Use this for "the day the user picked";
 * use Period for converting a server-issued UTC timestamp.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
