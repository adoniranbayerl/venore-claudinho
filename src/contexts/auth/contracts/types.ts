export type AuthenticatedUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  // Avatar escolhido via seletor de mídia — quando setado, tem prioridade sobre `image` (ver
  // consumidores de getCurrentUser, ex: resolve-theme-slot-props.ts).
  avatarMediaId: string | null;
};

export type UserRegistrationStatus = "pending" | "approved";

export type AuthProviderDescriptor = {
  key: "github" | "google" | "microsoft-entra-id" | "credentials" | "password";
  label: string;
  kind: "oauth" | "development" | "password";
  enabled: boolean;
  iconUrl?: string;
};
