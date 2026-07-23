export type RoleRef = {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
};

export type PermissionDefinition = {
  key: string;
  label: string;
};

export type UserRbacContext = {
  userId: string;
  roles: RoleRef[];
  permissions: string[];
  isSuperadmin: boolean;
};
