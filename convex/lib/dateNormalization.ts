import { ConvexError } from "convex/values";

const UTC_NOON_HOUR = 12;

const MONTH_BY_LABEL: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const isFiniteEpoch = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const buildUtcNoonEpochMs = (year: number, month: number, day: number): number | null => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }

  const epoch = Date.UTC(year, month - 1, day, UTC_NOON_HOUR, 0, 0, 0);
  const date = new Date(epoch);
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return epoch;
};

const parseIsoDate = (value: string): Date | null => {
  const epoch = Date.parse(value);
  if (!Number.isFinite(epoch)) {
    return null;
  }
  return new Date(epoch);
};

const normalizeString = (value: string | null | undefined): string => value?.trim() ?? "";

export const toUtcNoonEpochMsFromDateOnly = (value: Date): number =>
  Date.UTC(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    UTC_NOON_HOUR,
    0,
    0,
    0,
  );

export const parseProjectDeadlineEpochMs = (value: string | null | undefined): number | null => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const shortDot = normalized.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (shortDot) {
    const day = Number(shortDot[1]);
    const month = Number(shortDot[2]);
    const year = 2000 + Number(shortDot[3]);
    return buildUtcNoonEpochMs(year, month, day);
  }

  const longDot = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (longDot) {
    const day = Number(longDot[1]);
    const month = Number(longDot[2]);
    const year = Number(longDot[3]);
    return buildUtcNoonEpochMs(year, month, day);
  }

  const parsedDate = parseIsoDate(normalized);
  if (!parsedDate) {
    return null;
  }

  return buildUtcNoonEpochMs(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth() + 1,
    parsedDate.getUTCDate(),
  );
};

export const parseTaskDueDateEpochMs = (
  value: string | null | undefined,
  createdAtEpochMs: number | null | undefined,
): number | null => {
  const normalized = normalizeString(value);
  if (!normalized || normalized.toLowerCase() === "no date") {
    return null;
  }

  const monthDay = normalized.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (monthDay) {
    const month = MONTH_BY_LABEL[monthDay[1].toLowerCase()];
    const day = Number(monthDay[2]);
    if (!month) {
      return null;
    }

    const createdAt = isFiniteEpoch(createdAtEpochMs) ? new Date(createdAtEpochMs) : null;
    if (!createdAt) {
      return null;
    }
    const createdMonth = createdAt.getUTCMonth() + 1;
    const createdDay = createdAt.getUTCDate();
    let year = createdAt.getUTCFullYear();
    if (month < createdMonth || (month === createdMonth && day < createdDay)) {
      year += 1;
    }
    return buildUtcNoonEpochMs(year, month, day);
  }

  const parsedIso = parseIsoDate(normalized);
  if (parsedIso) {
    return buildUtcNoonEpochMs(
      parsedIso.getUTCFullYear(),
      parsedIso.getUTCMonth() + 1,
      parsedIso.getUTCDate(),
    );
  }
  return null;
};

export const parseDisplayDateEpochMs = (
  value: number | string | null | undefined,
  fallbackEpochMs: number,
): number | null => {
  if (isFiniteEpoch(value)) {
    return value;
  }
  if (typeof value === "number") {
    return isFiniteEpoch(fallbackEpochMs) ? fallbackEpochMs : null;
  }

  const normalized = normalizeString(typeof value === "string" ? value : null);
  if (!normalized) {
    return isFiniteEpoch(fallbackEpochMs) ? fallbackEpochMs : null;
  }

  const parsed = Date.parse(normalized);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return null;
};

export const assertFiniteEpochMs = (value: number | null | undefined, label: string): number => {
  if (!isFiniteEpoch(value)) {
    throw new ConvexError(`Invalid ${label}`);
  }
  return value;
};
