import { beforeEach, describe, expect, it, vi } from "vitest";

type RoleValues = { key: string; name: string; isSystem: boolean };
type RolePermissionValues = { roleId: string; permissionKey: string };

const selectLimit = vi.fn<() => Promise<Array<{ id: string }>>>();
const selectWhere = vi.fn(() => ({ limit: selectLimit }));
const selectFrom = vi.fn(() => ({ where: selectWhere }));
const txSelect = vi.fn(() => ({ from: selectFrom }));

const insertOnConflict = vi.fn<(config: unknown) => Promise<void>>();
const insertValues = vi.fn<(values: RoleValues[] | RolePermissionValues[]) => { onConflictDoNothing: typeof insertOnConflict }>(() => ({
  onConflictDoNothing: insertOnConflict,
}));
const txInsert = vi.fn(() => ({ values: insertValues }));

type Tx = { select: typeof txSelect; insert: typeof txInsert };
const tx: Tx = { select: txSelect, insert: txInsert };
const transactionMock = vi.fn(async (callback: (tx: Tx) => Promise<void>) => callback(tx));

vi.mock("@/infrastructure/database/client", () => ({
  db: { transaction: transactionMock },
}));

describe("ensureBaseRbacDataSeeded", () => {
  beforeEach(() => {
    transactionMock.mockClear();
    txSelect.mockClear();
    selectFrom.mockClear();
    selectWhere.mockClear();
    selectLimit.mockReset();
    txInsert.mockClear();
    insertValues.mockClear();
    insertOnConflict.mockReset().mockResolvedValue(undefined);
  });

  it("upserts the 3 system roles idempotently, ON CONFLICT DO NOTHING by key", async () => {
    selectLimit.mockResolvedValueOnce([{ id: "admin-role-id" }]);

    const { ensureBaseRbacDataSeeded } = await import("./ensure-base-rbac-data");
    await ensureBaseRbacDataSeeded();

    const rolesValuesArg = insertValues.mock.calls[0][0];
    expect(rolesValuesArg).toEqual([
      { key: "superadmin", name: "Super Admin", isSystem: true },
      { key: "admin", name: "Admin", isSystem: true },
      { key: "member", name: "Member", isSystem: true },
    ]);
    expect(insertOnConflict).toHaveBeenCalledTimes(2);
  });

  it("grants the admin role its base permissions once the admin role id is resolved", async () => {
    selectLimit.mockResolvedValueOnce([{ id: "admin-role-id" }]);

    const { ensureBaseRbacDataSeeded } = await import("./ensure-base-rbac-data");
    await ensureBaseRbacDataSeeded();

    const permissionsValuesArg = insertValues.mock.calls[1][0] as RolePermissionValues[];
    expect(permissionsValuesArg).toHaveLength(15);
    expect(permissionsValuesArg.every((row) => row.roleId === "admin-role-id")).toBe(true);
    expect(permissionsValuesArg.map((row) => row.permissionKey)).toContain("platform.admin.access");
    expect(permissionsValuesArg.map((row) => row.permissionKey)).not.toContain("media.purge");
  });

  it("does not touch role_permissions when the admin role still can't be resolved", async () => {
    selectLimit.mockResolvedValueOnce([]);

    const { ensureBaseRbacDataSeeded } = await import("./ensure-base-rbac-data");
    await ensureBaseRbacDataSeeded();

    expect(txInsert).toHaveBeenCalledTimes(1);
  });
});
