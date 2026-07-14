/**
 * Formats a Date as a "YYYY-MM-DD" string using its *local* calendar date.
 *
 * `date.toISOString().slice(0, 10)` looks equivalent but converts to UTC
 * first — in negative UTC-offset timezones (e.g. US Pacific), local midnight
 * lands on the *previous* UTC day, silently shifting every date-only string
 * (expense dates, report bucket keys, day-range boundaries) back by a day.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
