const SLUG_SANITIZE_PATTERN = /[^a-z0-9]+/g;
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(SLUG_SANITIZE_PATTERN, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
const normalizeTokenLength = (length: number): number =>
  Math.max(1, Math.floor(length));
const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
const createRandomTokenFromBytes = (length: number): string => {
  const byteCount = Math.max(Math.ceil(length / 2), 4);
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return toHex(bytes).slice(0, length);
};
export const createSecureToken = (length = 12): string => {
  const normalizedLength = normalizeTokenLength(length);
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      let token = "";
      while (token.length < normalizedLength) {
        token += crypto.randomUUID().replace(/-/g, "");
      }
      return token.slice(0, normalizedLength);
    }
    if (typeof crypto.getRandomValues === "function") {
      return createRandomTokenFromBytes(normalizedLength);
    }
  }
  throw new Error("Secure token generation requires Web Crypto API support.");
};
export const createClientId = (prefix = "id", length = 16): string =>
  `${prefix}-${createSecureToken(length)}`;
export const buildProjectPublicId = (name?: string): string =>
  `${slugify(name || "untitled")}-${createSecureToken(12)}`;
