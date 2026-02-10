import { useEffect, useRef } from "react";

type SupportedTarget = EventTarget | null | undefined;

type UseGlobalEventListenerArgs = {
  target: SupportedTarget;
  type: string;
  listener: (event: Event) => void;
  options?: AddEventListenerOptions | boolean;
  enabled?: boolean;
};

const abortSignalIds = new WeakMap<AbortSignal, number>();
let nextAbortSignalId = 1;

const getAbortSignalId = (signal: AbortSignal): number => {
  const existingId = abortSignalIds.get(signal);
  if (existingId) {
    return existingId;
  }

  const newId = nextAbortSignalId;
  nextAbortSignalId += 1;
  abortSignalIds.set(signal, newId);
  return newId;
};

const getOptionsKey = (options: AddEventListenerOptions | boolean | undefined): string => {
  if (typeof options === "boolean") {
    return `boolean:${String(options)}`;
  }

  if (!options) {
    return "none";
  }

  return [
    `capture:${String(Boolean(options.capture))}`,
    `once:${String(Boolean(options.once))}`,
    `passive:${String(Boolean(options.passive))}`,
    `signal:${options.signal ? getAbortSignalId(options.signal) : "none"}`,
  ].join("|");
};

export function useGlobalEventListener({
  target,
  type,
  listener,
  options,
  enabled = true,
}: UseGlobalEventListenerArgs) {
  const listenerRef = useRef(listener);
  const optionsRef = useRef(options);
  // Keep effect dependencies primitive so inline option objects do not force needless re-subscriptions.
  // Callers can still memoize `options` for readability if they prefer.
  const optionsKey = getOptionsKey(options);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!enabled || !target || typeof target.addEventListener !== "function") {
      return;
    }

    const wrappedListener: EventListener = (event) => {
      listenerRef.current(event);
    };
    const listenerOptions = optionsRef.current;

    target.addEventListener(type, wrappedListener, listenerOptions);

    return () => {
      target.removeEventListener(type, wrappedListener, listenerOptions);
    };
  }, [enabled, optionsKey, target, type]);
}
