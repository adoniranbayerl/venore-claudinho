import { describe, expect, it } from "vitest";
import { validateUpdateAgendaEventInput } from "./validation";

describe("validateUpdateAgendaEventInput", () => {
  it("accepts a valid update", () => {
    expect(validateUpdateAgendaEventInput({ eventId: "e1", title: "Reunião", startAt: new Date() })).toBeNull();
  });

  it("rejects a missing eventId", () => {
    expect(validateUpdateAgendaEventInput({ eventId: "", title: "Reunião", startAt: new Date() })?.code).toBe(
      "broadcast.update-agenda-event.invalid_event",
    );
  });

  it("rejects an empty title", () => {
    expect(validateUpdateAgendaEventInput({ eventId: "e1", title: "  ", startAt: new Date() })?.code).toBe(
      "broadcast.update-agenda-event.invalid_title",
    );
  });

  it("rejects an invalid date", () => {
    expect(validateUpdateAgendaEventInput({ eventId: "e1", title: "Reunião", startAt: new Date("not-a-date") })?.code).toBe(
      "broadcast.update-agenda-event.invalid_date",
    );
  });
});
