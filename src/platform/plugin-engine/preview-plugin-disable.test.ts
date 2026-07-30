import { beforeEach, describe, expect, it, vi } from "vitest";

const countUsersWithPermissions = vi.fn();

vi.mock("@/contexts/rbac", () => ({
  countUsersWithPermissions: (...args: unknown[]) => countUsersWithPermissions(...args),
}));

const registerPlugins = vi.fn();

vi.mock("./register-plugins", () => ({
  registerPlugins: (...args: unknown[]) => registerPlugins(...args),
}));

describe("previewPluginDisable", () => {
  beforeEach(() => {
    countUsersWithPermissions.mockReset();
    registerPlugins.mockReset();
  });

  it("collects navigation labels, permission labels and affected user count from the manifest", async () => {
    registerPlugins.mockResolvedValue({
      entries: [
        {
          key: "birthdays",
          status: "active",
          manifest: {
            key: "birthdays",
            name: "Aniversariantes",
            permissions: [{ key: "birthdays.read", label: "Ver aniversariantes" }],
            navigation: [{ key: "birthdays.admin", label: "Aniversariantes" }],
          },
          errors: [],
        },
      ],
    });
    countUsersWithPermissions.mockResolvedValue({ success: true, data: 4 });

    const { previewPluginDisable } = await import("./preview-plugin-disable");
    const preview = await previewPluginDisable("birthdays");

    expect(countUsersWithPermissions).toHaveBeenCalledWith({ permissionKeys: ["birthdays.read"] });
    expect(preview).toEqual({
      pluginKey: "birthdays",
      pluginName: "Aniversariantes",
      blockedByDependents: [],
      navigationLabels: ["Aniversariantes"],
      permissionLabels: ["Ver aniversariantes"],
      affectedUserCount: 4,
    });
  });

  it("lists enabled dependents that block the disable", async () => {
    registerPlugins.mockResolvedValue({
      entries: [
        { key: "birthdays", status: "active", manifest: { key: "birthdays", name: "Aniversariantes" }, errors: [] },
        {
          key: "party",
          status: "active",
          manifest: { key: "party", name: "Festa", dependencies: [{ pluginKey: "birthdays", type: "required" }] },
          errors: [],
        },
      ],
    });
    countUsersWithPermissions.mockResolvedValue({ success: true, data: 0 });

    const { previewPluginDisable } = await import("./preview-plugin-disable");
    const preview = await previewPluginDisable("birthdays");

    expect(preview.blockedByDependents).toEqual([{ key: "party", name: "Festa" }]);
  });
});
