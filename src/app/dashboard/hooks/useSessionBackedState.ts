import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type DeserializeState<T> = (value: unknown) => T | undefined;

const SESSION_STATE_PREFIX = "dashboard:ui-state:v1:";

const readState = <T>(
  key: string,
  fallback: T,
  deserialize: DeserializeState<T>,
): T => {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as unknown;
    return deserialize(parsed) ?? fallback;
  } catch {
    return fallback;
  }
};

export const useSessionBackedState = <T>(
  storageKey: string,
  fallback: T,
  deserialize: DeserializeState<T>,
): [T, Dispatch<SetStateAction<T>>] => {
  const key = useMemo(
    () => `${SESSION_STATE_PREFIX}${storageKey}`,
    [storageKey],
  );
  const fallbackRef = useRef(fallback);
  const deserializeRef = useRef(deserialize);

  fallbackRef.current = fallback;
  deserializeRef.current = deserialize;

  const [state, setState] = useState<T>(() =>
    readState(key, fallbackRef.current, deserializeRef.current),
  );

  useEffect(() => {
    setState(readState(key, fallbackRef.current, deserializeRef.current));
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore quota and serialization failures for non-critical UI state.
    }
  }, [key, state]);

  return [state, setState];
};
