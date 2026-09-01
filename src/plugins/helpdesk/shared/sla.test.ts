import { describe, expect, it } from "vitest";
import { DEFAULT_SLA_MINUTES, slaAtRisk, slaBreached, slaDueAt, slaState, needsSlaAtRiskAlert } from "./sla";

// docs/chamados-plugin.md §2.4/§5 — dueAt, breach, atRisk. Puro, sem I/O.
describe("shared/sla", () => {
  const created = new Date("2026-09-01T00:00:00.000Z");

  describe("slaDueAt", () => {
    it("soma os minutos de resolução ao instante de início", () => {
      expect(slaDueAt(created, 60).toISOString()).toBe("2026-09-01T01:00:00.000Z");
      expect(slaDueAt(created, DEFAULT_SLA_MINUTES.normal.resolutionMinutes).toISOString()).toBe(
        "2026-09-02T00:00:00.000Z",
      );
    });
  });

  describe("slaBreached", () => {
    const due = new Date("2026-09-01T10:00:00.000Z");

    it("false quando não há prazo", () => {
      expect(slaBreached({ slaDueAt: null, resolvedAt: null, createdAt: created })).toBe(false);
    });
    it("false quando o chamado já foi resolvido, mesmo com prazo no passado", () => {
      expect(
        slaBreached(
          { slaDueAt: due, resolvedAt: new Date("2026-09-01T09:00:00.000Z"), createdAt: created },
          new Date("2026-09-01T20:00:00.000Z"),
        ),
      ).toBe(false);
    });
    it("false enquanto o prazo está no futuro", () => {
      expect(slaBreached({ slaDueAt: due, resolvedAt: null, createdAt: created }, new Date("2026-09-01T09:59:00.000Z"))).toBe(
        false,
      );
    });
    it("true quando o prazo passou e o chamado não foi resolvido", () => {
      expect(slaBreached({ slaDueAt: due, resolvedAt: null, createdAt: created }, new Date("2026-09-01T10:00:01.000Z"))).toBe(
        true,
      );
    });
  });

  describe("slaAtRisk", () => {
    // janela de 10 h → 80 % = 08:00
    const due = new Date("2026-09-01T10:00:00.000Z");
    const snap = { slaDueAt: due, resolvedAt: null, createdAt: created };

    it("false antes de 80 % do prazo", () => {
      expect(slaAtRisk(snap, new Date("2026-09-01T07:59:00.000Z"))).toBe(false);
    });
    it("true a partir de 80 % do prazo", () => {
      expect(slaAtRisk(snap, new Date("2026-09-01T08:00:00.000Z"))).toBe(true);
    });
    it("false depois de estourar (aí é breach, não risco)", () => {
      expect(slaAtRisk(snap, new Date("2026-09-01T10:30:00.000Z"))).toBe(false);
    });
    it("false quando não há prazo ou o chamado já foi resolvido", () => {
      expect(slaAtRisk({ ...snap, slaDueAt: null }, new Date("2026-09-01T09:00:00.000Z"))).toBe(false);
      expect(slaAtRisk({ ...snap, resolvedAt: created }, new Date("2026-09-01T09:00:00.000Z"))).toBe(false);
    });
  });

  describe("slaState", () => {
    const due = new Date("2026-09-01T10:00:00.000Z");
    it("none sem prazo, ok no começo, at_risk perto do fim, breached depois", () => {
      expect(slaState({ slaDueAt: null, resolvedAt: null, createdAt: created })).toBe("none");
      expect(slaState({ slaDueAt: due, resolvedAt: null, createdAt: created }, new Date("2026-09-01T01:00:00.000Z"))).toBe("ok");
      expect(slaState({ slaDueAt: due, resolvedAt: null, createdAt: created }, new Date("2026-09-01T09:00:00.000Z"))).toBe(
        "at_risk",
      );
      expect(slaState({ slaDueAt: due, resolvedAt: null, createdAt: created }, new Date("2026-09-01T11:00:00.000Z"))).toBe(
        "breached",
      );
    });
    it("ok (assentado) quando resolvido, mesmo fora do prazo", () => {
      expect(
        slaState({ slaDueAt: due, resolvedAt: new Date("2026-09-01T12:00:00.000Z"), createdAt: created }, new Date("2026-09-02T00:00:00.000Z")),
      ).toBe("ok");
    });
  });

  describe("needsSlaAtRiskAlert", () => {
    const due = new Date("2026-09-01T10:00:00.000Z");
    const snap = { slaDueAt: due, resolvedAt: null, createdAt: created };
    it("true tanto em risco quanto estourado, false antes e quando resolvido", () => {
      expect(needsSlaAtRiskAlert(snap, new Date("2026-09-01T05:00:00.000Z"))).toBe(false);
      expect(needsSlaAtRiskAlert(snap, new Date("2026-09-01T09:00:00.000Z"))).toBe(true);
      expect(needsSlaAtRiskAlert(snap, new Date("2026-09-01T12:00:00.000Z"))).toBe(true);
      expect(needsSlaAtRiskAlert({ ...snap, resolvedAt: created }, new Date("2026-09-01T12:00:00.000Z"))).toBe(false);
    });
  });
});
