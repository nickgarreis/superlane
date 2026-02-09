import { describe, expect, test } from "vitest";
import {
  compareNullableEpochMsAsc,
  formatProjectDeadlineLong,
  formatProjectDeadlineMedium,
  formatProjectDeadlineShort,
  formatTaskDueDate,
  fromUtcNoonEpochMsToDateOnly,
  toUtcNoonEpochMsFromDateOnly,
} from "./dates";

describe("date helpers", () => {
  test("round-trips date-only epoch via UTC noon anchor", () => {
    const source = new Date(Date.UTC(2026, 1, 9, 0, 0, 0, 0));
    const epochMs = toUtcNoonEpochMsFromDateOnly(source);
    const roundTrip = fromUtcNoonEpochMsToDateOnly(epochMs);

    expect(epochMs).toBe(Date.UTC(2026, 1, 9, 12, 0, 0, 0));
    expect(roundTrip).toBeDefined();
    expect(roundTrip?.getFullYear()).toBe(2026);
    expect(roundTrip?.getMonth()).toBe(1);
    expect(roundTrip?.getDate()).toBe(9);
  });

  test("formats task/project dates with current UI strings", () => {
    const epochMs = Date.UTC(2026, 1, 9, 12, 0, 0, 0);

    expect(formatTaskDueDate(epochMs)).toBe("Feb 9");
    expect(formatTaskDueDate(null)).toBe("No date");
    expect(formatProjectDeadlineShort(epochMs)).toBe("09.02.26");
    expect(formatProjectDeadlineLong(epochMs)).toBe("09.02.2026");
    expect(formatProjectDeadlineMedium(epochMs)).toBe("09 Feb 2026");
    expect(formatProjectDeadlineMedium(null)).toBe("Not set");
  });

  test("sort comparator places undated tasks last", () => {
    const a = Date.UTC(2026, 1, 9, 12, 0, 0, 0);
    const b = Date.UTC(2026, 1, 10, 12, 0, 0, 0);

    expect(compareNullableEpochMsAsc(a, b)).toBeLessThan(0);
    expect(compareNullableEpochMsAsc(null, b)).toBeGreaterThan(0);
    expect(compareNullableEpochMsAsc(undefined, null)).toBe(0);
  });
});
