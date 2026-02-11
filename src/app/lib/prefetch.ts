type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };
const SLOW_EFFECTIVE_TYPES = new Set(["slow-2g", "2g"]);
const getConnection = (): NetworkInformationLike | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  return (navigator as Navigator & { connection?: NetworkInformationLike })
    .connection;
};
export const canPrefetch = (): boolean => {
  const connection = getConnection();
  if (!connection) {
    return true;
  }
  if (connection.saveData) {
    return false;
  }
  const effectiveType = String(connection.effectiveType ?? "").toLowerCase();
  return !SLOW_EFFECTIVE_TYPES.has(effectiveType);
};
type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };
export const scheduleIdlePrefetch = (
  task: () => Promise<unknown> | void,
  timeoutMs = 1500,
): (() => void) => {
  if (typeof window === "undefined" || !canPrefetch()) {
    return () => {};
  }
  const idleWindow = window as IdleWindow;
  if (typeof idleWindow.requestIdleCallback === "function") {
    const handle = idleWindow.requestIdleCallback(
      () => {
        void task();
      },
      { timeout: timeoutMs },
    );
    return () => {
      if (typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(handle);
      }
    };
  }
  const handle = window.setTimeout(() => {
    void task();
  }, timeoutMs);
  return () => {
    window.clearTimeout(handle);
  };
};
