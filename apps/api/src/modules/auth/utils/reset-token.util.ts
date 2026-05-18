import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

export function generateResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
