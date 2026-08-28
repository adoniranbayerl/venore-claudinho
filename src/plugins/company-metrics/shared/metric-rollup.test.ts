import { describe, expect, it } from "vitest";
import { aggregateValues, rollupTarget } from "./metric-rollup";

describe("aggregateValues", () => {
  it("sums / takes last / averages", () => {
    expect(aggregateValues([10, 20, 30], "sum")).toBe(60);
    expect(aggregateValues([10, 20, 30], "last")).toBe(30);
    expect(aggregateValues([10, 20, 30], "average")).toBe(20);
  });

  it("returns 0 for an empty series", () => {
    expect(aggregateValues([], "sum")).toBe(0);
    expect(aggregateValues([], "last")).toBe(0);
  });
});

describe("rollupTarget — the 300-entries example", () => {
  // Meta "Entradas 2026/2" = 300. Matriculados 210 (realized), pendentes 55 + sem pagamento 35
  // (at_risk). Limiar de "no ritmo" 0,85.
  const rollup = rollupTarget({
    targetValue: 300,
    onTrackThreshold: 0.85,
    lines: [
      { classification: "realized", weight: 1, resolvedValue: 210 },
      { classification: "at_risk", weight: 1, resolvedValue: 55 },
      { classification: "at_risk", weight: 1, resolvedValue: 35 },
    ],
  });

  it("headline is the realized total", () => {
    expect(rollup.headline).toBe(210);
    expect(rollup.realized).toBe(210);
    expect(rollup.atRisk).toBe(90);
  });

  it("optimistic adds the at-risk parcels", () => {
    expect(rollup.optimistic).toBe(300);
    expect(rollup.optimisticCompletion).toBe(1);
  });

  it("gap and completion track only the headline", () => {
    expect(rollup.gap).toBe(90);
    expect(rollup.completion).toBeCloseTo(0.7, 5);
  });

  it("status is 'below' at 70% with a 0.85 threshold", () => {
    expect(rollup.status).toBe("below");
  });
});

describe("rollupTarget — status thresholds", () => {
  const line = (resolvedValue: number) => ({ classification: "realized" as const, weight: 1, resolvedValue });

  it("met at 100%+", () => {
    expect(rollupTarget({ targetValue: 100, onTrackThreshold: 0.85, lines: [line(100)] }).status).toBe("met");
    expect(rollupTarget({ targetValue: 100, onTrackThreshold: 0.85, lines: [line(140)] }).status).toBe("met");
  });

  it("on_track between threshold and 100%", () => {
    expect(rollupTarget({ targetValue: 100, onTrackThreshold: 0.85, lines: [line(90)] }).status).toBe("on_track");
  });

  it("below under the threshold", () => {
    expect(rollupTarget({ targetValue: 100, onTrackThreshold: 0.85, lines: [line(84)] }).status).toBe("below");
  });
});

describe("rollupTarget — weights and subtract", () => {
  it("applies weight per line and abates subtract lines", () => {
    const rollup = rollupTarget({
      targetValue: 1000,
      onTrackThreshold: 0.8,
      lines: [
        { classification: "realized", weight: 2, resolvedValue: 300 }, // 600
        { classification: "subtract", weight: 1, resolvedValue: 50 },
        { classification: "projected", weight: 1, resolvedValue: 200 },
      ],
    });
    expect(rollup.realized).toBe(600);
    expect(rollup.subtract).toBe(50);
    expect(rollup.optimistic).toBe(600 + 0 + 200 - 50);
    expect(rollup.headline).toBe(600);
  });
});

describe("rollupTarget — degenerate target", () => {
  it("completion is 0 when targetValue <= 0", () => {
    const rollup = rollupTarget({ targetValue: 0, onTrackThreshold: 0.85, lines: [{ classification: "realized", weight: 1, resolvedValue: 10 }] });
    expect(rollup.completion).toBe(0);
    expect(rollup.status).toBe("below");
  });
});
