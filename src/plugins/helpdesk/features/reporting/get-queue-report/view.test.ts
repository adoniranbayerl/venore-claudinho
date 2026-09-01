import { describe, expect, it } from "vitest";
import { buildQueueReport } from "./view";
import type { QueueReportTicketFact } from "./types";

const HOUR = 60 * 60 * 1000;

function fact(over: Partial<QueueReportTicketFact>): QueueReportTicketFact {
  return {
    queueId: "q1",
    status: "resolved",
    createdAt: new Date("2026-09-01T00:00:00Z"),
    resolvedAt: new Date("2026-09-01T02:00:00Z"),
    slaDueAt: null,
    ratingScore: null,
    ...over,
  };
}

describe("buildQueueReport", () => {
  it("emits one row per queue, even a queue with no tickets", () => {
    const report = buildQueueReport([{ id: "q1", name: "TI" }, { id: "q2", name: "Manutenção" }], []);
    expect(report.rows.map((r) => r.queueName)).toEqual(["TI", "Manutenção"]);
    expect(report.rows[0]).toMatchObject({
      openCount: 0,
      resolvedCount: 0,
      slaMetPct: null,
      avgResolutionMinutes: null,
      avgRating: null,
      ratedCount: 0,
    });
  });

  it("counts only non-terminal tickets as open", () => {
    const facts = [
      fact({ status: "open", resolvedAt: null }),
      fact({ status: "in_progress", resolvedAt: null }),
      fact({ status: "waiting", resolvedAt: null }),
      fact({ status: "resolved" }),
      fact({ status: "closed" }),
      fact({ status: "cancelled", resolvedAt: null }),
    ];
    const report = buildQueueReport([{ id: "q1", name: "TI" }], facts);
    expect(report.rows[0].openCount).toBe(3);
    expect(report.rows[0].resolvedCount).toBe(2);
  });

  it("computes SLA-met % only over resolved tickets that had a due date", () => {
    const base = new Date("2026-09-01T00:00:00Z");
    const facts = [
      // met: resolved before due
      fact({ createdAt: base, resolvedAt: new Date(base.getTime() + 1 * HOUR), slaDueAt: new Date(base.getTime() + 4 * HOUR) }),
      // missed: resolved after due
      fact({ createdAt: base, resolvedAt: new Date(base.getTime() + 6 * HOUR), slaDueAt: new Date(base.getTime() + 4 * HOUR) }),
      // no due date → ignored for the %
      fact({ createdAt: base, resolvedAt: new Date(base.getTime() + 2 * HOUR), slaDueAt: null }),
    ];
    const report = buildQueueReport([{ id: "q1", name: "TI" }], facts);
    expect(report.rows[0].slaMetPct).toBe(50);
  });

  it("averages resolution time (minutes) and rating over the right subsets", () => {
    const base = new Date("2026-09-01T00:00:00Z");
    const facts = [
      fact({ createdAt: base, resolvedAt: new Date(base.getTime() + 2 * HOUR), ratingScore: 5 }),
      fact({ createdAt: base, resolvedAt: new Date(base.getTime() + 4 * HOUR), ratingScore: 3 }),
      fact({ status: "open", resolvedAt: null, ratingScore: null }),
    ];
    const report = buildQueueReport([{ id: "q1", name: "TI" }], facts);
    expect(report.rows[0].avgResolutionMinutes).toBe(180); // (120 + 240) / 2
    expect(report.rows[0].avgRating).toBe(4);
    expect(report.rows[0].ratedCount).toBe(2);
  });

  it("returns null averages when nothing qualifies", () => {
    const report = buildQueueReport([{ id: "q1", name: "TI" }], [fact({ status: "open", resolvedAt: null })]);
    expect(report.rows[0].slaMetPct).toBeNull();
    expect(report.rows[0].avgResolutionMinutes).toBeNull();
    expect(report.rows[0].avgRating).toBeNull();
  });
});
