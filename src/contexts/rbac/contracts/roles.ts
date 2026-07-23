export const SYSTEM_ROLE_KEYS = ["superadmin", "admin", "member"] as const;

export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];
