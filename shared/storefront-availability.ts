export const HOLIDAY_ORDERING_RESUMES_AT = new Date("2026-10-08T00:00:00+01:00");

export function isHolidayOrderingPaused(now = new Date()): boolean {
  return now < HOLIDAY_ORDERING_RESUMES_AT;
}
