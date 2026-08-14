import { describe, expect, it } from "vitest";
import { isEventHappeningNow, resolveEventEndDate, resolveEventOccurrenceDate } from "./weekly-recurrence";

// Referência fixa: quarta-feira 2026-01-14, 10:00 local.
const NOW = new Date(2026, 0, 14, 10, 0, 0);

describe("resolveEventOccurrenceDate", () => {
  it("returns startAt unchanged when the event isn't recurring", () => {
    const startAt = new Date(2025, 5, 1, 9, 0, 0);
    expect(resolveEventOccurrenceDate({ startAt, recurring: false }, NOW)).toEqual(startAt);
  });

  it("keeps today's date when today IS the anchor's weekday and its time hasn't passed yet", () => {
    // Âncora: quarta-feira (mesmo dia da semana de NOW) às 14:00 — ainda não passou (NOW é 10:00).
    const anchor = new Date(2025, 5, 4, 14, 0, 0); // 2025-06-04 também é uma quarta-feira
    const result = resolveEventOccurrenceDate({ startAt: anchor, recurring: true }, NOW);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(14);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(0);
  });

  it("jumps to next week when today IS the anchor's weekday but its time already passed", () => {
    // Âncora: quarta-feira às 08:00 — já passou (NOW é 10:00 do mesmo dia da semana).
    const anchor = new Date(2025, 5, 4, 8, 0, 0);
    const result = resolveEventOccurrenceDate({ startAt: anchor, recurring: true }, NOW);
    expect(result.getDate()).toBe(21); // próxima quarta depois de 14/01
    expect(result.getHours()).toBe(8);
  });

  it("resolves to the correct upcoming day of week when the anchor is a different weekday", () => {
    // Âncora: sexta-feira (2025-06-06) às 18:00 — NOW é quarta 14/01; próxima sexta é 16/01.
    const anchor = new Date(2025, 5, 6, 18, 0, 0);
    const result = resolveEventOccurrenceDate({ startAt: anchor, recurring: true }, NOW);
    expect(result.getDay()).toBe(5); // sexta-feira
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(18);
  });

  it("resolves to a day earlier in the week (wraps to next week)", () => {
    // Âncora: segunda-feira (2025-06-02) às 09:00 — NOW é quarta 14/01; próxima segunda é 19/01.
    const anchor = new Date(2025, 5, 2, 9, 0, 0);
    const result = resolveEventOccurrenceDate({ startAt: anchor, recurring: true }, NOW);
    expect(result.getDay()).toBe(1); // segunda-feira
    expect(result.getDate()).toBe(19);
  });

  it("always resolves to a date at or after now, never in the past", () => {
    const anchor = new Date(2020, 0, 1, 0, 0, 0); // âncora bem antiga, qualquer dia da semana
    const result = resolveEventOccurrenceDate({ startAt: anchor, recurring: true }, NOW);
    expect(result.getTime()).toBeGreaterThanOrEqual(NOW.getTime());
    expect(result.getDay()).toBe(anchor.getDay());
  });

  it("does NOT jump to next week when the event's start passed but it's still ongoing (endAt given)", () => {
    // Âncora: quarta-feira (mesmo dia de NOW) 08:00–12:00 (4h de duração) — NOW é 10:00, dentro da
    // janela: o evento já começou mas ainda não acabou. Sem endAt, este MESMO anchor pularia pra
    // semana que vem (ver teste "jumps to next week..." acima, anchor idêntico) — bug real que
    // isEventHappeningNow dependia de corrigir (pedido: "apenas quando o evento acabar, retire
    // ele ou atualize a data").
    const anchor = new Date(2025, 5, 4, 8, 0, 0);
    const endAt = new Date(2025, 5, 4, 12, 0, 0);
    const result = resolveEventOccurrenceDate({ startAt: anchor, endAt, recurring: true }, NOW);
    expect(result.getDate()).toBe(14); // continua HOJE, não pula pra semana que vem
    expect(result.getHours()).toBe(8);
  });
});

describe("resolveEventEndDate", () => {
  it("returns null when there is no end date", () => {
    const startAt = new Date(2025, 5, 1, 9, 0, 0);
    expect(resolveEventEndDate({ startAt, endAt: null, recurring: false }, NOW)).toBeNull();
  });

  it("returns endAt unchanged when the event isn't recurring, even days later", () => {
    const startAt = new Date(2025, 5, 1, 9, 0, 0);
    const endAt = new Date(2025, 5, 4, 18, 0, 0); // 3 dias depois
    expect(resolveEventEndDate({ startAt, endAt, recurring: false }, NOW)).toEqual(endAt);
  });

  it("preserves a multi-day duration across weekly occurrences for a recurring event", () => {
    // Âncora: sexta-feira (2025-06-06) 18:00 até domingo (2025-06-08) 12:00 — 1 dia e 18h de duração.
    const startAt = new Date(2025, 5, 6, 18, 0, 0);
    const endAt = new Date(2025, 5, 8, 12, 0, 0);
    const durationMs = endAt.getTime() - startAt.getTime();

    const resolvedStart = resolveEventOccurrenceDate({ startAt, recurring: true }, NOW);
    const resolvedEnd = resolveEventEndDate({ startAt, endAt, recurring: true }, NOW);

    expect(resolvedEnd).not.toBeNull();
    expect(resolvedEnd!.getTime() - resolvedStart.getTime()).toBe(durationMs);
    // NOW é quarta 14/01; próxima sexta é 16/01, +1d18h cai domingo 18/01 às 12:00.
    expect(resolvedEnd!.getDate()).toBe(18);
    expect(resolvedEnd!.getHours()).toBe(12);
  });
});

describe("isEventHappeningNow", () => {
  it("returns false when there is no end date, even if the event already started", () => {
    const startAt = new Date(2026, 0, 14, 9, 0, 0);
    expect(isEventHappeningNow(startAt, null, NOW)).toBe(false);
  });

  it("returns true when now falls between start and end", () => {
    const startAt = new Date(2026, 0, 14, 9, 0, 0);
    const endAt = new Date(2026, 0, 14, 12, 0, 0);
    expect(isEventHappeningNow(startAt, endAt, NOW)).toBe(true); // NOW é 10:00, dentro da janela
  });

  it("returns false before the event starts", () => {
    const startAt = new Date(2026, 0, 14, 11, 0, 0);
    const endAt = new Date(2026, 0, 14, 12, 0, 0);
    expect(isEventHappeningNow(startAt, endAt, NOW)).toBe(false);
  });

  it("returns false after the event ends", () => {
    const startAt = new Date(2026, 0, 14, 7, 0, 0);
    const endAt = new Date(2026, 0, 14, 9, 0, 0);
    expect(isEventHappeningNow(startAt, endAt, NOW)).toBe(false);
  });

  it("accepts string dates (round-tripped through JSON, as they arrive client-side)", () => {
    expect(isEventHappeningNow("2026-01-14T09:00:00", "2026-01-14T12:00:00", NOW)).toBe(true);
  });
});
