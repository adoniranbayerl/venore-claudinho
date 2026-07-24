import { pluginManifestSchema, type PluginManifest } from "./manifest-schema";

export type ManifestValidation =
  | { valid: true; manifest: PluginManifest }
  | { valid: false; key: string; errors: string[] };

function extractKey(raw: unknown): string {
  if (typeof raw === "object" && raw !== null && "key" in raw && typeof (raw as { key: unknown }).key === "string") {
    return (raw as { key: string }).key;
  }
  return "unknown";
}

export function validateManifest(raw: unknown): ManifestValidation {
  const result = pluginManifestSchema.safeParse(raw);
  if (result.success) {
    return { valid: true, manifest: result.data };
  }

  return {
    valid: false,
    key: extractKey(raw),
    errors: result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
  };
}
