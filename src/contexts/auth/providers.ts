import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { AuthProviderDescriptor } from "./contracts/types";

function readEnvValue(key: string): string {
  const rawValue = process.env[key];
  if (typeof rawValue !== "string") return "";
  return rawValue.trim().replace(/^['"]|['"]$/g, "");
}

function readFirstEnvValue(keys: string[]): string {
  for (const key of keys) {
    const value = readEnvValue(key);
    if (value) return value;
  }
  return "";
}

function hasRequiredProviderEnv(keys: string[]): boolean {
  return keys.every((key) => Boolean(readEnvValue(key)));
}

function hasRequiredProviderEnvAliases(keyGroups: string[][]): boolean {
  return keyGroups.every((aliases) => Boolean(readFirstEnvValue(aliases)));
}

function isDevelopmentCredentialsEnabled(): boolean {
  return readEnvValue("AUTH_ENABLE_DEV_CREDENTIALS") === "true";
}

function readGithubCredentials(): { clientId: string; clientSecret: string } | null {
  if (!hasRequiredProviderEnvAliases([["GITHUB_ID", "AUTH_GITHUB_ID"], ["GITHUB_SECRET", "AUTH_GITHUB_SECRET"]])) {
    return null;
  }
  return {
    clientId: readFirstEnvValue(["GITHUB_ID", "AUTH_GITHUB_ID"]),
    clientSecret: readFirstEnvValue(["GITHUB_SECRET", "AUTH_GITHUB_SECRET"]),
  };
}

function readGoogleCredentials(): { clientId: string; clientSecret: string } | null {
  if (hasRequiredProviderEnv(["GOOGLE_ID", "GOOGLE_SECRET"])) {
    return { clientId: readEnvValue("GOOGLE_ID"), clientSecret: readEnvValue("GOOGLE_SECRET") };
  }
  if (hasRequiredProviderEnv(["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"])) {
    return { clientId: readEnvValue("AUTH_GOOGLE_ID"), clientSecret: readEnvValue("AUTH_GOOGLE_SECRET") };
  }
  return null;
}

function readMicrosoftCredentials(): { clientId: string; clientSecret: string; issuer: string } | null {
  if (!hasRequiredProviderEnv(["MICROSOFT_ID", "MICROSOFT_SECRET", "MICROSOFT_ISSUER"])) {
    return null;
  }
  return {
    clientId: readEnvValue("MICROSOFT_ID"),
    clientSecret: readEnvValue("MICROSOFT_SECRET"),
    issuer: readEnvValue("MICROSOFT_ISSUER"),
  };
}

export function buildAuthProviders() {
  const providers = [];

  const github = readGithubCredentials();
  if (github) {
    providers.push(GitHub({ clientId: github.clientId, clientSecret: github.clientSecret }));
  }

  const google = readGoogleCredentials();
  if (google) {
    providers.push(Google({ clientId: google.clientId, clientSecret: google.clientSecret }));
  }

  const microsoft = readMicrosoftCredentials();
  if (microsoft) {
    providers.push(
      MicrosoftEntraID({
        clientId: microsoft.clientId,
        clientSecret: microsoft.clientSecret,
        issuer: microsoft.issuer,
      }),
    );
  }

  if (isDevelopmentCredentialsEnabled()) {
    providers.push(
      Credentials({
        name: "Dev credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const username = typeof credentials?.username === "string" ? credentials.username : "";
          if (!username) return null;
          return { id: `dev-${username}`, name: username, email: `${username}@dev.local` };
        },
      }),
    );
  }

  return providers;
}

export function listAvailableAuthProviders(): AuthProviderDescriptor[] {
  return [
    { key: "github", label: "GitHub", kind: "oauth", enabled: readGithubCredentials() !== null },
    {
      key: "google",
      label: "Google",
      kind: "oauth",
      enabled: readGoogleCredentials() !== null,
      iconUrl: "/providers/google.svg",
    },
    {
      key: "microsoft-entra-id",
      label: "Microsoft",
      kind: "oauth",
      enabled: readMicrosoftCredentials() !== null,
      iconUrl: "/providers/microsoft.svg",
    },
    { key: "credentials", label: "Dev credentials", kind: "development", enabled: isDevelopmentCredentialsEnabled() },
  ];
}

export {
  hasRequiredProviderEnv,
  hasRequiredProviderEnvAliases,
  isDevelopmentCredentialsEnabled,
  readEnvValue,
  readFirstEnvValue,
};
