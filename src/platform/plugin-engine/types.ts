import type { PermissionDefinition } from "@/contexts/rbac";
import type { PluginManifest } from "./manifest-schema";

export type PluginRegistrationStatus = "active" | "invalid" | "incompatible" | "dependency_missing" | "cycle";

export type PluginRegistrationEntry = {
  key: string;
  status: PluginRegistrationStatus;
  manifest?: PluginManifest;
  errors: string[];
};

export type PluginRegistrationReport = {
  entries: PluginRegistrationEntry[];
  permissions: PermissionDefinition[];
  navigation: NonNullable<PluginManifest["navigation"]>;
  routes: NonNullable<PluginManifest["routes"]>;
  contentTypes: NonNullable<PluginManifest["contentTypes"]>;
  blocks: NonNullable<PluginManifest["blocks"]>;
};
