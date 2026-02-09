const AUTH_RETURN_TO_STORAGE_KEY = "builddesign.auth.returnTo";
const AUTH_MODE_STORAGE_KEY = "builddesign.auth.mode";

type StoredAuthMode = "signin" | "signup";

const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/;

const sanitizePath = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || CONTROL_CHARS_PATTERN.test(trimmed)) {
    return null;
  }
  if (!trimmed.startsWith("/")) {
    return null;
  }
  if (trimmed.startsWith("//") || trimmed.includes("://")) {
    return null;
  }
  return trimmed;
};

const sanitizeMode = (value: string | null | undefined): StoredAuthMode | null => {
  if (value === "signin" || value === "signup") {
    return value;
  }
  return null;
};

export const readStoredReturnTo = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return sanitizePath(window.sessionStorage.getItem(AUTH_RETURN_TO_STORAGE_KEY));
};

export const storeReturnTo = (value: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  const safeValue = sanitizePath(value);
  if (!safeValue) {
    return;
  }
  window.sessionStorage.setItem(AUTH_RETURN_TO_STORAGE_KEY, safeValue);
};

export const clearStoredReturnTo = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(AUTH_RETURN_TO_STORAGE_KEY);
};

export const readStoredAuthMode = (): StoredAuthMode | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return sanitizeMode(window.sessionStorage.getItem(AUTH_MODE_STORAGE_KEY));
};

export const storeAuthMode = (value: StoredAuthMode): void => {
  if (typeof window === "undefined") {
    return;
  }
  const safeValue = sanitizeMode(value);
  if (!safeValue) {
    return;
  }
  window.sessionStorage.setItem(AUTH_MODE_STORAGE_KEY, safeValue);
};

export const clearStoredAuthMode = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(AUTH_MODE_STORAGE_KEY);
};
