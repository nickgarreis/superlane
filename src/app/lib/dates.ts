import { format } from "date-fns";
const UTC_NOON_HOUR = 12;
const isFiniteEpoch = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export const toUtcNoonEpochMsFromDateOnly = (value: Date): number =>
  Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
    UTC_NOON_HOUR,
    0,
    0,
    0,
  );
export const fromUtcNoonEpochMsToDateOnly = (
  value: number | null | undefined,
): Date | undefined => {
  if (!isFiniteEpoch(value)) {
    return undefined;
  }
  const asUtc = new Date(value);
  return new Date(
    asUtc.getUTCFullYear(),
    asUtc.getUTCMonth(),
    asUtc.getUTCDate(),
    UTC_NOON_HOUR,
    0,
    0,
    0,
  );
};
export const formatTaskDueDate = (value: number | null | undefined): string => {
  if (!isFiniteEpoch(value)) {
    return "No date";
  }
  return format(new Date(value), "MMM d");
};
export const formatProjectDeadlineShort = (
  value: number | null | undefined,
): string => {
  if (!isFiniteEpoch(value)) {
    return "";
  }
  return format(new Date(value), "dd.MM.yy");
};
export const formatProjectDeadlineMedium = (
  value: number | null | undefined,
): string => {
  if (!isFiniteEpoch(value)) {
    return "Not set";
  }
  return format(new Date(value), "dd MMM yyyy");
};
export const formatProjectDeadlineLong = (
  value: number | null | undefined,
): string => {
  if (!isFiniteEpoch(value)) {
    return "Select date";
  }
  return format(new Date(value), "dd.MM.yyyy");
};
export const formatFileDisplayDate = (
  value: number | null | undefined,
): string => {
  if (!isFiniteEpoch(value)) {
    return "";
  }
  return new Date(value).toISOString();
};
export const compareNullableEpochMsAsc = (
  a: number | null | undefined,
  b: number | null | undefined,
) => {
  const aIsDate = isFiniteEpoch(a);
  const bIsDate = isFiniteEpoch(b);
  if (!aIsDate && !bIsDate) return 0;
  if (!aIsDate) return 1;
  if (!bIsDate) return -1;
  return a - b;
};
