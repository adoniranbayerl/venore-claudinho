import { describe, expect, it } from "vitest";
import { evaluateThrottle, KIOSK_SUBMIT_WINDOW_MS } from "./kiosk-throttle";

describe("evaluateThrottle", () => {
  it("allows the first submission for a token", () => {
    const state = new Map<string, number>();
    expect(evaluateThrottle(state, "tok-a", 1_000)).toEqual({ allowed: true });
  });

  it("blocks a second submission inside the window and reports the wait", () => {
    const state = new Map<string, number>();
    evaluateThrottle(state, "tok-a", 1_000);
    const decision = evaluateThrottle(state, "tok-a", 1_000 + 5_000);
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.retryAfterMs).toBe(KIOSK_SUBMIT_WINDOW_MS - 5_000);
  });

  it("allows again once the window has elapsed", () => {
    const state = new Map<string, number>();
    evaluateThrottle(state, "tok-a", 1_000);
    expect(evaluateThrottle(state, "tok-a", 1_000 + KIOSK_SUBMIT_WINDOW_MS)).toEqual({ allowed: true });
  });

  it("throttles each token independently", () => {
    const state = new Map<string, number>();
    evaluateThrottle(state, "tok-a", 1_000);
    expect(evaluateThrottle(state, "tok-b", 1_100)).toEqual({ allowed: true });
  });

  it("evicts expired entries when the map grows large", () => {
    const state = new Map<string, number>();
    for (let i = 0; i < 600; i += 1) state.set(`old-${i}`, 0);
    evaluateThrottle(state, "fresh", 10 * KIOSK_SUBMIT_WINDOW_MS);
    expect(state.has("old-0")).toBe(false);
    expect(state.has("fresh")).toBe(true);
  });
});
