import type { PluginManifest } from "./manifest-schema";

export type DependencyResolutionStatus = "active" | "dependency_missing" | "cycle";
export type DependencyResolution = Record<string, { status: DependencyResolutionStatus; errors: string[] }>;

// Recebe manifestos já validados e compatíveis com o core. Dois passos, nessa ordem:
// 1) ciclo (required + optional juntos formam o grafo — um ciclo é um ciclo, independente do
//    tipo de aresta) bloqueia todo mundo dentro dele, com erro explícito (docs/venore-docks.md —
//    "Ciclo de dependência entre plugins é inválido e bloqueia o registro de ambos").
// 2) dependência "required" ausente ou já bloqueada bloqueia em cascata, até ponto fixo.
// "optional" ausente nunca bloqueia — só fica registrado pro próprio plugin decidir em runtime.
export function resolveDependencies(manifests: PluginManifest[]): DependencyResolution {
  const byKey = new Map(manifests.map((manifest) => [manifest.key, manifest]));
  const result: DependencyResolution = {};

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const inCycle = new Set<string>();

  function visit(key: string, stack: string[]): void {
    color.set(key, GRAY);
    stack.push(key);

    const manifest = byKey.get(key);
    for (const dependency of manifest?.dependencies ?? []) {
      if (!byKey.has(dependency.pluginKey)) continue;

      const depColor = color.get(dependency.pluginKey) ?? WHITE;
      if (depColor === WHITE) {
        visit(dependency.pluginKey, stack);
      } else if (depColor === GRAY) {
        const cycleStart = stack.indexOf(dependency.pluginKey);
        for (const cycleKey of stack.slice(cycleStart)) {
          inCycle.add(cycleKey);
        }
      }
    }

    stack.pop();
    color.set(key, BLACK);
  }

  for (const key of byKey.keys()) {
    if ((color.get(key) ?? WHITE) === WHITE) {
      visit(key, []);
    }
  }

  for (const key of inCycle) {
    result[key] = {
      status: "cycle",
      errors: [`Plugin "${key}" faz parte de um ciclo de dependências: ${[...inCycle].join(" -> ")}.`],
    };
  }

  const remaining = [...byKey.keys()].filter((key) => !inCycle.has(key));
  const blocked = new Map<string, string[]>();
  let changed = true;

  while (changed) {
    changed = false;
    for (const key of remaining) {
      if (blocked.has(key)) continue;

      const manifest = byKey.get(key)!;
      const missing = (manifest.dependencies ?? [])
        .filter((dependency) => dependency.type === "required")
        .filter((dependency) => !byKey.has(dependency.pluginKey) || inCycle.has(dependency.pluginKey) || blocked.has(dependency.pluginKey));

      if (missing.length > 0) {
        blocked.set(
          key,
          missing.map((dependency) => `Dependência obrigatória "${dependency.pluginKey}" ausente ou bloqueada.`),
        );
        changed = true;
      }
    }
  }

  for (const key of remaining) {
    result[key] = blocked.has(key) ? { status: "dependency_missing", errors: blocked.get(key)! } : { status: "active", errors: [] };
  }

  return result;
}
