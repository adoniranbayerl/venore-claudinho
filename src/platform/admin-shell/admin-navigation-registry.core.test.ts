import { describe, expect, it } from "vitest";
import type { AdminNavItemDefinition } from "./admin-navigation.contracts";
import { assertUniqueNavigationKeys, buildVisibleAdminNavGroups } from "./admin-navigation-registry.core";
import type { AdminActor } from "./types";

function makeActor(overrides: Partial<AdminActor> = {}): AdminActor {
  return {
    id: "user-1",
    name: "Actor",
    email: "actor@example.com",
    isSuperadmin: false,
    permissions: [],
    ...overrides,
  };
}

function item(overrides: Partial<AdminNavItemDefinition>): AdminNavItemDefinition {
  return {
    key: "group.item",
    label: "Item",
    icon: "home",
    href: "/admin/item",
    groupKey: "group",
    groupLabel: "Group",
    groupOrder: 10,
    order: 10,
    ...overrides,
  };
}

describe("assertUniqueNavigationKeys", () => {
  it("does not throw when every key is unique", () => {
    const items = [item({ key: "a", href: "/admin/a" }), item({ key: "b", href: "/admin/b" })];
    expect(() => assertUniqueNavigationKeys(items)).not.toThrow();
  });

  it("throws when two items declare the same key, instead of letting the last one win", () => {
    const items = [item({ key: "dashboard", href: "/admin" }), item({ key: "dashboard", href: "/admin/other" })];
    expect(() => assertUniqueNavigationKeys(items)).toThrow(/duplicada.*dashboard/i);
  });
});

describe("buildVisibleAdminNavGroups", () => {
  it("hides items whose required permission the actor does not have", () => {
    const items = [item({ key: "a", requiredPermission: "some.permission" })];
    const groups = buildVisibleAdminNavGroups(makeActor(), items);
    expect(groups).toEqual([]);
  });

  it("shows items whose required permission the actor has", () => {
    const items = [item({ key: "a", requiredPermission: "some.permission" })];
    const groups = buildVisibleAdminNavGroups(makeActor({ permissions: ["some.permission"] }), items);
    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
  });

  it("shows every item to a superadmin regardless of permission", () => {
    const items = [item({ key: "a", requiredPermission: "some.permission" })];
    const groups = buildVisibleAdminNavGroups(makeActor({ isSuperadmin: true }), items);
    expect(groups[0].items).toHaveLength(1);
  });

  it("is satisfied by any permission in the list when requiredPermission is an array", () => {
    const items = [item({ key: "a", requiredPermission: ["perm.one", "perm.two"] })];
    const groups = buildVisibleAdminNavGroups(makeActor({ permissions: ["perm.two"] }), items);
    expect(groups[0].items).toHaveLength(1);
  });

  it("drops a group entirely once none of its items are visible", () => {
    const items = [
      item({ key: "visible", groupKey: "g1", requiredPermission: undefined }),
      item({ key: "hidden", groupKey: "g2", requiredPermission: "missing.permission" }),
    ];
    const groups = buildVisibleAdminNavGroups(makeActor(), items);
    expect(groups.map((group) => group.key)).toEqual(["g1"]);
  });

  it("orders groups by groupOrder and items within a group by order", () => {
    const items = [
      item({ key: "b", groupKey: "second", groupOrder: 20, order: 20 }),
      item({ key: "a-2", groupKey: "first", groupOrder: 10, order: 20 }),
      item({ key: "a-1", groupKey: "first", groupOrder: 10, order: 10 }),
    ];
    const groups = buildVisibleAdminNavGroups(makeActor(), items);
    expect(groups.map((group) => group.key)).toEqual(["first", "second"]);
    expect(groups[0].items.map((navItem) => navItem.key)).toEqual(["a-1", "a-2"]);
  });

  it("strips requiredPermission and internal group metadata from the sidebar item shape", () => {
    const items = [item({ key: "a", requiredPermission: "some.permission" })];
    const groups = buildVisibleAdminNavGroups(makeActor({ permissions: ["some.permission"] }), items);
    expect(groups[0].items[0]).toEqual({ key: "a", label: "Item", href: "/admin/item", icon: "home" });
  });
});
