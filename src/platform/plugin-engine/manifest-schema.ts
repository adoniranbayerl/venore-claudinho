import semver from "semver";
import { z } from "zod";

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const pluginDependencySchema = z.object({
  pluginKey: z.string().min(1),
  type: z.enum(["required", "optional"]),
});

const pluginCompatibilitySchema = z.object({
  coreVersion: z.string().refine((range) => semver.validRange(range) !== null, {
    message: 'coreVersion precisa ser uma faixa semver válida (ex: ">=2.0.0 <3.0.0").',
  }),
});

const pluginPermissionSchema = z.object({ key: z.string().min(1), label: z.string().min(1) });
const pluginSettingSchema = z.object({ key: z.string().min(1), defaultValue: z.unknown() });
const pluginNavigationSchema = z.object({ key: z.string().min(1), label: z.string().min(1), href: z.string().min(1) });
const pluginRouteSchema = z.object({ path: z.string().min(1), label: z.string().min(1) });
const pluginContentTypeSchema = z.object({ key: z.string().min(1), label: z.string().min(1) });
const pluginBlockSchema = z.object({ key: z.string().min(1), label: z.string().min(1) });

// Espelha o PluginManifest de docs/venore-docks.md — "Sistema de plugins" / "Contrato de
// manifesto", campo a campo.
export const pluginManifestSchema = z
  .object({
    manifestVersion: z.string().min(1),
    key: z.string().regex(KEBAB_CASE, "key precisa ser kebab-case."),
    name: z.string().min(1),
    version: z.string().refine((value) => semver.valid(value) !== null, {
      message: "version precisa ser um semver válido.",
    }),
    description: z.string().optional(),
    dependencies: z.array(pluginDependencySchema).optional(),
    compatibility: pluginCompatibilitySchema.optional(),
    permissions: z.array(pluginPermissionSchema).optional(),
    settings: z.array(pluginSettingSchema).optional(),
    navigation: z.array(pluginNavigationSchema).optional(),
    routes: z.array(pluginRouteSchema).optional(),
    contentTypes: z.array(pluginContentTypeSchema).optional(),
    blocks: z.array(pluginBlockSchema).optional(),
  })
  .superRefine((manifest, ctx) => {
    // Namespace de permission (docs/venore-docks.md — "Modelo de RBAC": "<plugin>.<recurso>.<acao>")
    // impede que um plugin declare uma permission colidindo com o catálogo do core ou de outro plugin.
    for (const permission of manifest.permissions ?? []) {
      if (!permission.key.startsWith(`${manifest.key}.`)) {
        ctx.addIssue({
          code: "custom",
          path: ["permissions"],
          message: `Permission "${permission.key}" precisa começar com o namespace "${manifest.key}.".`,
        });
      }
    }
  });

export type PluginManifest = z.infer<typeof pluginManifestSchema>;
