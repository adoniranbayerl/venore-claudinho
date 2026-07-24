import { describe, expect, it } from "vitest";
import type { PluginManifest } from "./manifest-schema";
import { resolveDependencies } from "./resolve-dependencies";

function manifest(key: string, dependencies?: PluginManifest["dependencies"]): PluginManifest {
  return { manifestVersion: "1.0.0", key, name: key, version: "1.0.0", dependencies };
}

describe("resolveDependencies", () => {
  it("marks a plugin with no dependencies as active", () => {
    const result = resolveDependencies([manifest("a")]);
    expect(result.a).toEqual({ status: "active", errors: [] });
  });

  it("marks a plugin active when its required dependency is present", () => {
    const result = resolveDependencies([manifest("a", [{ pluginKey: "b", type: "required" }]), manifest("b")]);
    expect(result.a.status).toBe("active");
    expect(result.b.status).toBe("active");
  });

  it("blocks a plugin when its required dependency is absent", () => {
    const result = resolveDependencies([manifest("a", [{ pluginKey: "missing", type: "required" }])]);
    expect(result.a.status).toBe("dependency_missing");
  });

  it("does not block a plugin when only its optional dependency is absent", () => {
    const result = resolveDependencies([manifest("a", [{ pluginKey: "missing", type: "optional" }])]);
    expect(result.a.status).toBe("active");
  });

  it("cascades a missing required dependency through the chain", () => {
    const result = resolveDependencies([
      manifest("a", [{ pluginKey: "b", type: "required" }]),
      manifest("b", [{ pluginKey: "missing", type: "required" }]),
    ]);
    expect(result.b.status).toBe("dependency_missing");
    expect(result.a.status).toBe("dependency_missing");
  });

  it("marks a direct cycle (a <-> b) as cycle for both plugins", () => {
    const result = resolveDependencies([
      manifest("a", [{ pluginKey: "b", type: "required" }]),
      manifest("b", [{ pluginKey: "a", type: "required" }]),
    ]);
    expect(result.a.status).toBe("cycle");
    expect(result.b.status).toBe("cycle");
  });

  it("marks an indirect cycle (a -> b -> c -> a) as cycle for all three plugins", () => {
    const result = resolveDependencies([
      manifest("a", [{ pluginKey: "b", type: "required" }]),
      manifest("b", [{ pluginKey: "c", type: "required" }]),
      manifest("c", [{ pluginKey: "a", type: "required" }]),
    ]);
    expect(result.a.status).toBe("cycle");
    expect(result.b.status).toBe("cycle");
    expect(result.c.status).toBe("cycle");
  });
});
