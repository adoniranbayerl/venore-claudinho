import { boolean, pgSchema, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/contexts/auth/database/schema";

export const rbacSchema = pgSchema("rbac");

export const roles = rbacSchema.table("roles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissions = rbacSchema.table(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionKey: text("permission_key").notNull(),
  },
  (rolePermission) => [
    primaryKey({ columns: [rolePermission.roleId, rolePermission.permissionKey] }),
  ],
);

export const userRoles = rbacSchema.table(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (userRole) => [primaryKey({ columns: [userRole.userId, userRole.roleId] })],
);
