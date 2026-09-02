import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = [
  "GITHUB_ID",
  "GITHUB_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "GOOGLE_ID",
  "GOOGLE_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "MICROSOFT_ID",
  "MICROSOFT_SECRET",
  "MICROSOFT_ISSUER",
  "AUTH_CREDENTIALS_USERNAME",
  "AUTH_CREDENTIALS_PASSWORD",
  "AUTH_LOGIN_USERNAME",
  "AUTH_LOGIN_PASSWORD",
  "AUTH_ENABLE_DEV_CREDENTIALS",
  "AUTH_DISABLE_CREDENTIALS",
];

function clearAuthEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe("providers env helpers", () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it("hasRequiredProviderEnv returns true only when all keys are present", async () => {
    const { hasRequiredProviderEnv } = await import("./providers");

    expect(hasRequiredProviderEnv(["GOOGLE_ID", "GOOGLE_SECRET"])).toBe(false);

    process.env.GOOGLE_ID = "id";
    expect(hasRequiredProviderEnv(["GOOGLE_ID", "GOOGLE_SECRET"])).toBe(false);

    process.env.GOOGLE_SECRET = "secret";
    expect(hasRequiredProviderEnv(["GOOGLE_ID", "GOOGLE_SECRET"])).toBe(true);
  });

  it("hasRequiredProviderEnv treats empty/whitespace values as absent", async () => {
    const { hasRequiredProviderEnv } = await import("./providers");

    process.env.GOOGLE_ID = "   ";
    process.env.GOOGLE_SECRET = "secret";
    expect(hasRequiredProviderEnv(["GOOGLE_ID", "GOOGLE_SECRET"])).toBe(false);
  });

  it("hasRequiredProviderEnv strips accidental surrounding quotes", async () => {
    const { readEnvValue } = await import("./providers");

    process.env.GOOGLE_ID = "\"abc123\"";
    expect(readEnvValue("GOOGLE_ID")).toBe("abc123");

    process.env.GOOGLE_SECRET = "'xyz'";
    expect(readEnvValue("GOOGLE_SECRET")).toBe("xyz");
  });

  it("hasRequiredProviderEnvAliases passes when at least one alias per group is present", async () => {
    const { hasRequiredProviderEnvAliases } = await import("./providers");

    expect(
      hasRequiredProviderEnvAliases([
        ["GITHUB_ID", "AUTH_GITHUB_ID"],
        ["GITHUB_SECRET", "AUTH_GITHUB_SECRET"],
      ]),
    ).toBe(false);

    process.env.AUTH_GITHUB_ID = "id";
    process.env.GITHUB_SECRET = "secret";
    expect(
      hasRequiredProviderEnvAliases([
        ["GITHUB_ID", "AUTH_GITHUB_ID"],
        ["GITHUB_SECRET", "AUTH_GITHUB_SECRET"],
      ]),
    ).toBe(true);
  });

  it("isDevelopmentCredentialsEnabled requires the exact flag value", async () => {
    const { isDevelopmentCredentialsEnabled } = await import("./providers");

    expect(isDevelopmentCredentialsEnabled()).toBe(false);

    process.env.AUTH_ENABLE_DEV_CREDENTIALS = "yes";
    expect(isDevelopmentCredentialsEnabled()).toBe(false);

    process.env.AUTH_ENABLE_DEV_CREDENTIALS = "true";
    expect(isDevelopmentCredentialsEnabled()).toBe(true);
  });

  it("isDevelopmentCredentialsEnabled is false in production even with the flag set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.AUTH_ENABLE_DEV_CREDENTIALS = "true";
    try {
      const { isDevelopmentCredentialsEnabled } = await import("./providers");
      expect(isDevelopmentCredentialsEnabled()).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("isCredentialsDisabled requires the exact flag value \"true\"", async () => {
    const { isCredentialsDisabled } = await import("./providers");

    expect(isCredentialsDisabled()).toBe(false);

    process.env.AUTH_DISABLE_CREDENTIALS = "1";
    expect(isCredentialsDisabled()).toBe(false);

    process.env.AUTH_DISABLE_CREDENTIALS = "yes";
    expect(isCredentialsDisabled()).toBe(false);

    process.env.AUTH_DISABLE_CREDENTIALS = '"true"';
    expect(isCredentialsDisabled()).toBe(true);
  });
});

describe("buildAuthProviders", () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it("returns an empty array when no provider env vars are set", async () => {
    const { buildAuthProviders } = await import("./providers");
    expect(buildAuthProviders().map((provider) => provider.id)).toEqual(["credentials"]);
  });

  it("includes only the providers with complete env vars", async () => {
    process.env.GOOGLE_ID = "id";
    process.env.GOOGLE_SECRET = "secret";

    const { buildAuthProviders } = await import("./providers");
    const providers = buildAuthProviders();

    expect(providers.map((provider) => provider.id)).toEqual(["google", "credentials"]);
  });

  it("supports the AUTH_ prefixed Google alias", async () => {
    process.env.AUTH_GOOGLE_ID = "id";
    process.env.AUTH_GOOGLE_SECRET = "secret";

    const { buildAuthProviders } = await import("./providers");
    const providers = buildAuthProviders();

    expect(providers.map((provider) => provider.id)).toEqual(["google", "credentials"]);
  });

  it("builds github, google and microsoft together, plus dev credentials when enabled", async () => {
    process.env.GITHUB_ID = "gh-id";
    process.env.GITHUB_SECRET = "gh-secret";
    process.env.GOOGLE_ID = "g-id";
    process.env.GOOGLE_SECRET = "g-secret";
    process.env.MICROSOFT_ID = "m-id";
    process.env.MICROSOFT_SECRET = "m-secret";
    process.env.MICROSOFT_ISSUER = "m-issuer";
    process.env.AUTH_ENABLE_DEV_CREDENTIALS = "true";

    const { buildAuthProviders } = await import("./providers");
    const providers = buildAuthProviders();

    expect(providers.map((p) => p.id)).toEqual(["github", "google", "microsoft-entra-id", "credentials"]);
  });

  it("adds password credentials when the env pair is present", async () => {
    process.env.AUTH_CREDENTIALS_USERNAME = "operator";
    process.env.AUTH_CREDENTIALS_PASSWORD = "secret";

    const { buildAuthProviders } = await import("./providers");
    const providers = buildAuthProviders();

    expect(providers).toHaveLength(1);
    expect(providers[0].id).toBe("credentials");
  });

  it("omits microsoft when the issuer is missing", async () => {
    process.env.MICROSOFT_ID = "m-id";
    process.env.MICROSOFT_SECRET = "m-secret";

    const { buildAuthProviders } = await import("./providers");
    expect(buildAuthProviders().map((provider) => provider.id)).toEqual(["credentials"]);
  });

  it("omits dev credentials when the flag is not exactly \"true\"", async () => {
    process.env.AUTH_ENABLE_DEV_CREDENTIALS = "1";

    const { buildAuthProviders } = await import("./providers");
    expect(buildAuthProviders().map((provider) => provider.id)).toEqual(["credentials"]);
  });

  it("omits the credentials provider when AUTH_DISABLE_CREDENTIALS is \"true\"", async () => {
    process.env.AUTH_DISABLE_CREDENTIALS = "true";

    const { buildAuthProviders } = await import("./providers");
    expect(buildAuthProviders()).toEqual([]);
  });

  it("keeps OAuth providers but drops credentials when disabled", async () => {
    process.env.GOOGLE_ID = "id";
    process.env.GOOGLE_SECRET = "secret";
    process.env.AUTH_DISABLE_CREDENTIALS = "true";

    const { buildAuthProviders } = await import("./providers");
    expect(buildAuthProviders().map((provider) => provider.id)).toEqual(["google"]);
  });

  it("still includes credentials when AUTH_DISABLE_CREDENTIALS is not exactly \"true\"", async () => {
    process.env.AUTH_DISABLE_CREDENTIALS = "1";

    const { buildAuthProviders } = await import("./providers");
    expect(buildAuthProviders().map((provider) => provider.id)).toEqual(["credentials"]);
  });
});

describe("listAvailableAuthProviders", () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it("reports every provider as disabled when no env vars are set", async () => {
    const { listAvailableAuthProviders } = await import("./providers");

    expect(listAvailableAuthProviders()).toEqual([
      { key: "github", label: "GitHub", kind: "oauth", enabled: false },
      { key: "google", label: "Google", kind: "oauth", enabled: false, iconUrl: "/providers/google.svg" },
      {
        key: "microsoft-entra-id",
        label: "Microsoft",
        kind: "oauth",
        enabled: false,
        iconUrl: "/providers/microsoft.svg",
      },
      { key: "credentials", label: "Senha", kind: "password", enabled: true },
    ]);
  });

  it("reflects the same detection state as buildAuthProviders", async () => {
    process.env.GITHUB_ID = "gh-id";
    process.env.GITHUB_SECRET = "gh-secret";
    process.env.AUTH_CREDENTIALS_USERNAME = "operator";
    process.env.AUTH_CREDENTIALS_PASSWORD = "secret";
    process.env.AUTH_ENABLE_DEV_CREDENTIALS = "true";

    const { listAvailableAuthProviders } = await import("./providers");
    const descriptors = listAvailableAuthProviders();

    expect(descriptors.find((d) => d.key === "github")?.enabled).toBe(true);
    expect(descriptors.find((d) => d.key === "google")?.enabled).toBe(false);
    expect(descriptors.find((d) => d.key === "microsoft-entra-id")?.enabled).toBe(false);
    expect(descriptors.find((d) => d.key === "credentials")?.enabled).toBe(true);
  });

  it("marks credentials as disabled when AUTH_DISABLE_CREDENTIALS is \"true\"", async () => {
    process.env.AUTH_DISABLE_CREDENTIALS = "true";

    const { listAvailableAuthProviders } = await import("./providers");
    expect(listAvailableAuthProviders().find((d) => d.key === "credentials")?.enabled).toBe(false);
  });
});
