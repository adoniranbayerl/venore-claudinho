import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const insertCourse = vi.fn();

vi.mock("./store", () => ({
  insertCourse: (...args: unknown[]) => insertCourse(...args),
}));

describe("createCourse", () => {
  beforeEach(() => {
    insertCourse.mockReset();
  });

  it("creates the course recording the actor as createdBy", async () => {
    insertCourse.mockResolvedValue({
      id: "course-1",
      title: "Intro",
      description: null,
      createdBy: "actor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createCourse } = await import("./service");
    const result = await createCourse({ title: "Intro", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(insertCourse).toHaveBeenCalledWith({ title: "Intro", description: undefined, createdBy: "actor-1" });
  });
});
