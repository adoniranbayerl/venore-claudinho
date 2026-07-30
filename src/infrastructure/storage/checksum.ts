import { createHash } from "node:crypto";

export function computeSha256Hex(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
