import { describe, expect, it } from "vitest";
import { formatTicketReference, parseTicketReference } from "./ticket-reference";

describe("formatTicketReference", () => {
  it("joins the queue key and the per-queue sequence", () => {
    expect(formatTicketReference({ queueKey: "ti", seq: 1042 })).toBe("ti-1042");
    expect(formatTicketReference({ queueKey: "manutencao", seq: 87 })).toBe("manutencao-87");
  });
});

describe("parseTicketReference", () => {
  it("splits a plain key and sequence", () => {
    expect(parseTicketReference("ti-1042")).toEqual({ queueKey: "ti", seq: 1042 });
  });

  it("keeps hyphens that belong to a multi-word queue slug", () => {
    expect(parseTicketReference("suporte-tecnico-9")).toEqual({ queueKey: "suporte-tecnico", seq: 9 });
  });

  it("is case-insensitive and trims", () => {
    expect(parseTicketReference("  TI-7 ")).toEqual({ queueKey: "ti", seq: 7 });
  });

  it("round-trips with formatTicketReference", () => {
    const ref = formatTicketReference({ queueKey: "manutencao", seq: 87 });
    expect(parseTicketReference(ref)).toEqual({ queueKey: "manutencao", seq: 87 });
  });

  it("rejects a missing sequence, non-numeric tail or zero/negative seq", () => {
    expect(parseTicketReference("ti")).toBeNull();
    expect(parseTicketReference("ti-")).toBeNull();
    expect(parseTicketReference("ti-abc")).toBeNull();
    expect(parseTicketReference("ti-0")).toBeNull();
    expect(parseTicketReference("ti--1")).toBeNull();
    expect(parseTicketReference("")).toBeNull();
  });
});
