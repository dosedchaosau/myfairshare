import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

function key(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  const material = raw && raw.trim().length >= 16 ? raw.trim() : "my-fair-share-preview-only";
  return createHash("sha256").update(material).digest();
}

/** AES-256-GCM. Empty stays empty. Already-sealed values are returned as-is. */
export function seal(plain: string): string {
  if (!plain) return "";
  if (plain.startsWith("enc:v1:")) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${Buffer.concat([iv, tag, data]).toString("base64url")}`;
}

export function open(value: string | null | undefined): string {
  if (!value) return "";
  if (!value.startsWith("enc:v1:")) return value;
  const buf = Buffer.from(value.slice(7), "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Blind index for lookups. Not reversible. */
export function blind(value: string): string {
  return createHmac("sha256", key()).update(value.trim().toLowerCase()).digest("hex");
}
