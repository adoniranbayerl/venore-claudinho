import { beforeEach, describe, expect, it, vi } from "vitest";

const previewPluginDisable = vi.fn();
vi.mock("./preview-plugin-disable", () => ({
  previewPluginDisable: (...args: unknown[]) => previewPluginDisable(...args),
}));

const listExtensionStates = vi.fn();
vi.mock("@/contexts/extensions", () => ({
  listExtensionStates: (...args: unknown[]) => listExtensionStates(...args),
}));

const execute = vi.fn();
vi.mock("@/infrastructure/database/client", () => ({
  db: { execute: (...args: unknown[]) => execute(...args) },
}));

vi.mock("./run-plugin-migrations", () => ({
  resolveMigrationsSchema: (key: string, declared: string | undefined) =>
    declared ?? `${key.replace(/-/g, "_")}_migrations`,
}));

vi.mock("@/plugins/registry", () => ({
  PLUGIN_REGISTRY: [
    { key: "enrollment-dashboard", migrationsPath: "./migrations", migrationsSchema: "enrollment_dashboard_migrations" },
    { key: "donations" },
  ],
}));

const BASE = {
  pluginKey: "enrollment-dashboard",
  pluginName: "Dashboard de Matrícula",
  blockedByDependents: [],
  navigationLabels: ["Matrículas"],
  permissionLabels: ["Ver o dashboard"],
  affectedUserCount: 4,
};

describe("previewPluginUninstall", () => {
  beforeEach(() => {
    previewPluginDisable.mockReset();
    listExtensionStates.mockReset();
    execute.mockReset();
    previewPluginDisable.mockResolvedValue({ ...BASE });
    listExtensionStates.mockResolvedValue({
      success: true,
      data: { "enrollment-dashboard": { installed: true, enabled: true } },
    });
  });

  it("adds the plugin schemas, per-table row counts and namespace footprint to the disable preview", async () => {
    execute
      .mockResolvedValueOnce({ rows: [{ table_name: "institutions" }, { table_name: "programs" }] })
      .mockResolvedValueOnce({ rows: [{ count: 3 }] })
      .mockResolvedValueOnce({ rows: [{ count: 5 }] })
      .mockResolvedValueOnce({ rows: [{ count: 2 }] })
      .mockResolvedValueOnce({ rows: [{ count: 6 }] });

    const { previewPluginUninstall } = await import("./preview-plugin-uninstall");
    const preview = await previewPluginUninstall("enrollment-dashboard");

    expect(preview).toEqual({
      ...BASE,
      installed: true,
      dataSchema: "enrollment_dashboard",
      migrationsSchema: "enrollment_dashboard_migrations",
      tables: [
        { name: "institutions", rowCount: 3 },
        { name: "programs", rowCount: 5 },
      ],
      settingsCount: 2,
      grantedPermissionCount: 6,
    });
  });

  it("reports no schema for a settings-only plugin and skips the information_schema scan", async () => {
    previewPluginDisable.mockResolvedValue({ ...BASE, pluginKey: "donations", pluginName: "Doações" });
    listExtensionStates.mockResolvedValue({ success: true, data: { donations: { installed: true, enabled: true } } });
    execute.mockResolvedValueOnce({ rows: [{ count: 1 }] }).mockResolvedValueOnce({ rows: [{ count: 0 }] });

    const { previewPluginUninstall } = await import("./preview-plugin-uninstall");
    const preview = await previewPluginUninstall("donations");

    expect(preview.dataSchema).toBeNull();
    expect(preview.migrationsSchema).toBeNull();
    expect(preview.tables).toEqual([]);
    expect(preview.settingsCount).toBe(1);
    expect(preview.grantedPermissionCount).toBe(0);
    // só as duas contagens de namespace, nenhuma varredura de information_schema.
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
