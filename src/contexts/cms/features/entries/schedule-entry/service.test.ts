import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findEntryById = vi.fn();
const markEntryScheduled = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
  markEntryScheduled: (...args: unknown[]) => markEntryScheduled(...args),
}));

const assertCmsCategoryScope = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  assertCmsCategoryScope: (...args: unknown[]) => assertCmsCategoryScope(...args),
}));

describe("scheduleEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
    markEntryScheduled.mockReset();
    assertCmsCategoryScope.mockReset();
    assertCmsCategoryScope.mockResolvedValue({ success: true, data: undefined });
  });

  it("rejects when cms.entries.publish does not reach the entry's category (Fase C / D6)", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "draft", categoryId: "cat-a" });
    assertCmsCategoryScope.mockResolvedValue({
      success: false,
      error: { code: "cms.entries.forbidden_scope", message: "sem publish nesta categoria" },
    });

    const { scheduleEntry } = await import("./service");
    const result = await scheduleEntry({
      id: "entry-1",
      scheduledPublishAt: new Date("2099-01-01T00:00:00.000Z"),
      actorId: "actor-1",
    });

    expect(result.success).toBe(false);
    expect(assertCmsCategoryScope).toHaveBeenCalledWith("actor-1", ["cms.entries.publish"], "cat-a");
    expect(markEntryScheduled).not.toHaveBeenCalled();
  });

  it("schedules a draft entry with a future publish date", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "draft" });
    markEntryScheduled.mockResolvedValue({ id: "entry-1", status: "scheduled" });

    const scheduledPublishAt = new Date("2099-01-01T00:00:00.000Z");
    const { scheduleEntry } = await import("./service");
    const result = await scheduleEntry({ id: "entry-1", scheduledPublishAt, actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "scheduled" } });
    expect(markEntryScheduled).toHaveBeenCalledWith("entry-1", { scheduledPublishAt, scheduledArchiveAt: null });
  });

  it("fails when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { scheduleEntry } = await import("./service");
    const result = await scheduleEntry({
      id: "missing",
      scheduledPublishAt: new Date("2099-01-01T00:00:00.000Z"),
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.not_found", message: expect.any(String) } });
    expect(markEntryScheduled).not.toHaveBeenCalled();
  });

  it("fails when the entry is already published", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "published" });

    const { scheduleEntry } = await import("./service");
    const result = await scheduleEntry({
      id: "entry-1",
      scheduledPublishAt: new Date("2099-01-01T00:00:00.000Z"),
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.cannot_schedule", message: expect.any(String) } });
    expect(markEntryScheduled).not.toHaveBeenCalled();
  });

  it("fails when the entry is already archived", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "archived" });

    const { scheduleEntry } = await import("./service");
    const result = await scheduleEntry({
      id: "entry-1",
      scheduledPublishAt: new Date("2099-01-01T00:00:00.000Z"),
      actorId: "actor-1",
    });

    expect(result.success).toBe(false);
    expect(markEntryScheduled).not.toHaveBeenCalled();
  });
});
