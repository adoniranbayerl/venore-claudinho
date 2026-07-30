import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "system", type: "system" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

vi.mock("@/contexts/rbac", () => ({
  RBAC_PERMISSIONS: [{ key: "rbac.roles.manage", label: "Manage roles" }],
}));

const registerDefaultSetting = vi.fn();

vi.mock("@/contexts/settings", () => ({
  registerDefaultSetting: (...args: unknown[]) => registerDefaultSetting(...args),
}));

vi.mock("@/plugins/registry", () => ({
  PLUGIN_REGISTRY: [],
}));

const listExtensionStates = vi.fn();

vi.mock("@/contexts/extensions", () => ({
  listExtensionStates: (...args: unknown[]) => listExtensionStates(...args),
}));

const goodManifest = {
  manifestVersion: "1.0.0",
  key: "birthdays",
  name: "Birthdays",
  version: "1.0.0",
  permissions: [{ key: "birthdays.entries.manage", label: "Manage birthdays" }],
  settings: [{ key: "birthdays.reminder_days", defaultValue: 7 }],
  navigation: [
    {
      key: "birthdays",
      label: "Birthdays",
      href: "/admin/birthdays",
      icon: "cake",
      groupKey: "content",
      groupLabel: "Conteúdo",
      groupOrder: 20,
      order: 50,
    },
  ],
};

const malformedManifest = { name: "No key, no version" };

describe("registerPlugins", () => {
  beforeEach(() => {
    registerDefaultSetting.mockReset();
    registerDefaultSetting.mockResolvedValue({ success: true, data: { key: "x", registered: true } });
    listExtensionStates.mockReset();
    listExtensionStates.mockResolvedValue({ success: true, data: {} });
  });

  it("processes a good plugin next to a malformed one without either blocking the other", async () => {
    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([goodManifest, malformedManifest]);

    const goodEntry = report.entries.find((e) => e.key === "birthdays");
    const badEntry = report.entries.find((e) => e.key === "unknown");

    expect(goodEntry).toMatchObject({ status: "active" });
    expect(badEntry).toMatchObject({ status: "invalid" });
    expect(badEntry?.errors.length).toBeGreaterThan(0);
  });

  it("aggregates the active plugin's permissions with RBAC_PERMISSIONS", async () => {
    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([goodManifest]);

    expect(report.permissions).toEqual([
      { key: "rbac.roles.manage", label: "Manage roles" },
      { key: "birthdays.entries.manage", label: "Manage birthdays" },
    ]);
  });

  it("registers the active plugin's declared settings as defaults", async () => {
    const { registerPlugins } = await import("./register-plugins");
    await registerPlugins([goodManifest]);

    expect(registerDefaultSetting).toHaveBeenCalledWith({ key: "birthdays.reminder_days", value: 7 });
  });

  it("collects navigation without registering it anywhere else", async () => {
    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([goodManifest]);

    expect(report.navigation).toEqual([
      {
        key: "birthdays",
        label: "Birthdays",
        href: "/admin/birthdays",
        icon: "cake",
        groupKey: "content",
        groupLabel: "Conteúdo",
        groupOrder: 20,
        order: 50,
      },
    ]);
  });

  it("does not register settings for a plugin that fails validation", async () => {
    const { registerPlugins } = await import("./register-plugins");
    await registerPlugins([malformedManifest]);

    expect(registerDefaultSetting).not.toHaveBeenCalled();
  });

  it("marks a plugin incompatible when its coreVersion range excludes the running core", async () => {
    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([{ ...goodManifest, compatibility: { coreVersion: ">=3.0.0" } }]);

    const entry = report.entries.find((e) => e.key === "birthdays");
    expect(entry?.status).toBe("incompatible");
    expect(registerDefaultSetting).not.toHaveBeenCalled();
  });

  it("blocks a plugin whose required dependency is missing", async () => {
    const dependent = {
      manifestVersion: "1.0.0",
      key: "party",
      name: "Party",
      version: "1.0.0",
      dependencies: [{ pluginKey: "missing", type: "required" }],
    };
    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([dependent]);

    const entry = report.entries.find((e) => e.key === "party");
    expect(entry?.status).toBe("dependency_missing");
  });

  it("marks a plugin disabled instead of validating compatibility/dependencies, and skips its settings", async () => {
    listExtensionStates.mockResolvedValue({ success: true, data: { birthdays: false } });

    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([{ ...goodManifest, compatibility: { coreVersion: ">=3.0.0" } }]);

    const entry = report.entries.find((e) => e.key === "birthdays");
    expect(entry).toMatchObject({ status: "disabled", manifest: expect.objectContaining({ key: "birthdays" }) });
    expect(registerDefaultSetting).not.toHaveBeenCalled();
    expect(report.permissions).not.toContainEqual({ key: "birthdays.entries.manage", label: "Manage birthdays" });
    expect(report.navigation).toEqual([]);
  });

  it("treats a disabled required dependency as missing for a dependent plugin", async () => {
    listExtensionStates.mockResolvedValue({ success: true, data: { birthdays: false } });

    const dependent = {
      manifestVersion: "1.0.0",
      key: "party",
      name: "Party",
      version: "1.0.0",
      dependencies: [{ pluginKey: "birthdays", type: "required" }],
    };

    const { registerPlugins } = await import("./register-plugins");
    const report = await registerPlugins([goodManifest, dependent]);

    expect(report.entries.find((e) => e.key === "birthdays")?.status).toBe("disabled");
    expect(report.entries.find((e) => e.key === "party")?.status).toBe("dependency_missing");
  });
});
