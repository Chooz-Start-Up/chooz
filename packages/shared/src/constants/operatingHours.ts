import type { OperatingHours } from "../types/restaurant";

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const DEFAULT_OPERATING_HOURS: OperatingHours = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [day, { open: "09:00", close: "22:00", isClosed: true }]),
);
