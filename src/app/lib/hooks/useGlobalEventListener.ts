import { useEffect, useRef } from "react";
type SupportedTarget = EventTarget | null | undefined;
type TargetRef = { readonly current: SupportedTarget };
const isRefTarget = (target: SupportedTarget | TargetRef): target is TargetRef =>
  typeof target === "object" && target !== null && "current" in target;
type UseGlobalEventListenerArgs = {
  target: SupportedTarget | TargetRef;
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
const getOptionsKey = (
  options: AddEventListenerOptions | boolean | undefined,
): string => {
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
  const optionsKey = getOptionsKey(options);
  const resolvedTarget = isRefTarget(target) ? target.current : target;
  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  useEffect(() => {
    if (
      !enabled ||
      !resolvedTarget ||
      typeof resolvedTarget.addEventListener !== "function"
    ) {
      return;
    }
    const wrappedListener: EventListener = (event) => {
      listenerRef.current(event);
    };
    const listenerOptions = optionsRef.current;
    resolvedTarget.addEventListener(type, wrappedListener, listenerOptions);
    return () => {
      resolvedTarget.removeEventListener(type, wrappedListener, listenerOptions);
    };
  }, [enabled, optionsKey, resolvedTarget, type]);
}
