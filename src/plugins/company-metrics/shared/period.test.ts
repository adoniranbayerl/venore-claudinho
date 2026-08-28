import { describe, expect, it } from "vitest";
import { bucketStart, currentBucket, isValidCivilDate, listBuckets, nextBucket } from "./period";

describe("bucketStart", () => {
  it("daily is the same day", () => {
    expect(bucketStart("2026-08-19", "daily")).toBe("2026-08-19");
  });

  it("monthly is the first of the month", () => {
    expect(bucketStart("2026-08-19", "monthly")).toBe("2026-08-01");
  });

  it("weekly is the Monday of that ISO week", () => {
    // 2026-08-19 is a Wednesday -> Monday is 2026-08-17
    expect(bucketStart("2026-08-19", "weekly")).toBe("2026-08-17");
    // a Monday maps to itself
    expect(bucketStart("2026-08-17", "weekly")).toBe("2026-08-17");
    // a Sunday belongs to the week that started the previous Monday
    expect(bucketStart("2026-08-23", "weekly")).toBe("2026-08-17");
  });
});

describe("nextBucket", () => {
  it("advances daily/weekly/monthly", () => {
    expect(nextBucket("2026-08-19", "daily")).toBe("2026-08-20");
    expect(nextBucket("2026-08-17", "weekly")).toBe("2026-08-24");
    expect(nextBucket("2026-08-01", "monthly")).toBe("2026-09-01");
    expect(nextBucket("2026-12-01", "monthly")).toBe("2027-01-01");
  });
});

describe("listBuckets", () => {
  it("lists inclusive month buckets", () => {
    expect(listBuckets("2026-06-15", "2026-09-02", "monthly")).toEqual([
      "2026-06-01",
      "2026-07-01",
      "2026-08-01",
      "2026-09-01",
    ]);
  });

  it("returns a single bucket when from and to share it", () => {
    expect(listBuckets("2026-08-03", "2026-08-27", "monthly")).toEqual(["2026-08-01"]);
  });
});

describe("currentBucket", () => {
  it("uses the civil date in the given time zone", () => {
    // 2026-08-01T02:00Z is still 2026-07-31 in America/Sao_Paulo (GMT-3)
    const instant = new Date("2026-08-01T02:00:00Z");
    expect(currentBucket("monthly", "America/Sao_Paulo", instant)).toBe("2026-07-01");
    expect(currentBucket("monthly", "UTC", instant)).toBe("2026-08-01");
  });
});

describe("isValidCivilDate", () => {
  it("accepts real dates and rejects junk", () => {
    expect(isValidCivilDate("2026-02-28")).toBe(true);
    expect(isValidCivilDate("2026-02-30")).toBe(false);
    expect(isValidCivilDate("2026-8-1")).toBe(false);
    expect(isValidCivilDate("nope")).toBe(false);
  });
});
