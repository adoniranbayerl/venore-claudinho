import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

const getUserContext = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  getUserContext: (...args: unknown[]) => getUserContext(...args),
}));

const getCourseForStudent = vi.fn();
const isEnrolled = vi.fn();
vi.mock("@/plugins/academy", () => ({
  getCourseForStudent: (...args: unknown[]) => getCourseForStudent(...args),
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const actorUser = { id: "actor-1", email: "actor@example.com", name: "Actor" };
const course = {
  id: "course-1",
  slug: "curso",
  title: "Curso",
  description: "desc",
  status: "published",
  createdBy: "teacher-1",
  selfEnrollmentEnabled: true,
  publiclyListed: true,
};

describe("getAcademyCourseAccess", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
    getCourseForStudent.mockReset();
    isEnrolled.mockReset();
  });

  it("is unauthenticated when there is no session", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result).toEqual({ mode: "unauthenticated" });
    expect(getCourseForStudent).not.toHaveBeenCalled();
  });

  it("is not-found when the course does not exist or is not published", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCourseForStudent.mockResolvedValue({ success: true, data: null });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result).toEqual({ mode: "not-found" });
    expect(getCourseForStudent).toHaveBeenCalledWith({ slug: "curso" });
  });

  it("redirects to the slug when the legacy uuid still resolves to a course", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    const legacyId = "11111111-2222-3333-4444-555555555555";
    getCourseForStudent.mockImplementation(async (query: { id?: string; slug?: string }) => {
      if ("slug" in query) return { success: true, data: null };
      return { success: true, data: course };
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: legacyId });

    expect(result).toEqual({ mode: "redirect", slug: "curso" });
    expect(getCourseForStudent).toHaveBeenCalledWith({ slug: legacyId });
    expect(getCourseForStudent).toHaveBeenCalledWith({ id: legacyId });
  });

  it("is not-found when the slug looks like a uuid but resolves nowhere", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    const legacyId = "11111111-2222-3333-4444-555555555555";
    getCourseForStudent.mockResolvedValue({ success: true, data: null });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: legacyId });

    expect(result).toEqual({ mode: "not-found" });
  });

  it("is full when the actor is enrolled", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: true });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result.mode).toBe("full");
    expect(getUserContext).not.toHaveBeenCalled();
  });

  it("is preview for a superadmin who is not enrolled and not the course creator", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: [], isSuperadmin: true },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result.mode).toBe("preview");
  });

  it("is preview for the course creator with academy.courses.manage", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { ...actorUser, id: "teacher-1" } });
    getCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "teacher-1", roles: [], permissions: ["academy.courses.manage"], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result.mode).toBe("preview");
  });

  it("is NOT preview for an actor with academy.courses.manage who did not create the course", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: ["academy.courses.manage"], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result.mode).toBe("enroll-available");
  });

  it("is enroll-available when not enrolled, no preview access, and self-enrollment is on", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCourseForStudent.mockResolvedValue({ success: true, data: course });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: [], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result.mode).toBe("enroll-available");
  });

  it("is restricted when not enrolled, no preview access, and self-enrollment is off", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: actorUser });
    getCourseForStudent.mockResolvedValue({ success: true, data: { ...course, selfEnrollmentEnabled: false } });
    isEnrolled.mockResolvedValue({ success: true, data: false });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "actor-1", roles: [], permissions: [], isSuperadmin: false },
    });

    const { getAcademyCourseAccess } = await import("./get-academy-course-access");
    const result = await getAcademyCourseAccess({ courseSlug: "curso" });

    expect(result.mode).toBe("restricted");
  });
});
