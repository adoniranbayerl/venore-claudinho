import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const findEnrollment = vi.fn();
const insertEnrollment = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  insertEnrollment: (...args: unknown[]) => insertEnrollment(...args),
}));

const publishedCourse = { id: "course-1", status: "published", selfEnrollmentEnabled: true };

describe("enrollSelf", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    findEnrollment.mockReset();
    insertEnrollment.mockReset();
  });

  it("enrolls the actor when the course exists, is published and allows self-enrollment", async () => {
    findCourseById.mockResolvedValue(publishedCourse);
    findEnrollment.mockResolvedValue(null);
    insertEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "actor-1", enrolledBy: "self" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: true,
      data: { id: "enrollment-1", courseId: "course-1", actorId: "actor-1", enrolledBy: "self" },
    });
    expect(insertEnrollment).toHaveBeenCalledWith({ courseId: "course-1", actorId: "actor-1", enrolledBy: "self" });
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.course_not_found", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when the course is not published", async () => {
    findCourseById.mockResolvedValue({ ...publishedCourse, status: "draft" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when self-enrollment is disabled", async () => {
    findCourseById.mockResolvedValue({ ...publishedCourse, selfEnrollmentEnabled: false });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.self_enrollment_disabled", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when the actor is already enrolled", async () => {
    findCourseById.mockResolvedValue(publishedCourse);
    findEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "actor-1" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.already_enrolled", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });
});
