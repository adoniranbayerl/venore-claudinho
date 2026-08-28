export const SYSTEM_ROLE_KEYS = ["superadmin", "admin", "member", "editor", "author"] as const;

export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];
