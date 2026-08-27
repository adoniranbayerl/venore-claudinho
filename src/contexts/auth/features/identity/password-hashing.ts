import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Formato canônico de senha do projeto: `scrypt$<saltBase64>$<hashBase64>`. É o que o provider
// Credentials (contexts/auth/providers.ts) espera no login, via verifyPasswordHash abaixo. scrypt
// do node:crypto com custo padrão (N=16384, r=8, p=1), derivando 64 bytes a partir de um salt
// aleatório de 16 bytes. Módulo interno do context de auth — não é reexportado pelo barrel.
const scrypt = promisify(scryptCallback);
const DERIVED_KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = (await scrypt(password, salt, DERIVED_KEY_LENGTH)) as Buffer;
  return `scrypt$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPasswordHash(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, saltBase64, hashBase64] = storedHash.split("$");
  if (algorithm !== "scrypt" || !saltBase64 || !hashBase64) return false;

  const salt = Buffer.from(saltBase64, "base64");
  const expectedHash = Buffer.from(hashBase64, "base64");
  const derived = (await scrypt(password, salt, expectedHash.length)) as Buffer;
  if (derived.length !== expectedHash.length) return false;
  return timingSafeEqual(derived, expectedHash);
}
