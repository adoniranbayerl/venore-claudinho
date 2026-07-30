import { RBAC_PERMISSIONS } from "@/contexts/rbac/contracts/permissions";

export function PermissionCheckboxes({ selectedKeys = [] as string[] }: { selectedKeys?: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {RBAC_PERMISSIONS.map((permission) => (
        <label key={permission.key} className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            name="permissionKeys"
            value={permission.key}
            defaultChecked={selectedKeys.includes(permission.key)}
            className="rounded-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
          />
          {permission.label}
        </label>
      ))}
    </div>
  );
}
