import "@testing-library/jest-dom/vitest";

if (
  typeof Element !== "undefined" &&
  typeof Element.prototype.scrollIntoView !== "function"
) {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    value: () => {},
    writable: true,
    configurable: true,
  });
}

if (typeof window !== "undefined") {
  type MediaQueryListener = (event: MediaQueryListEvent) => void;
  const listenersByQuery = new Map<string, Set<MediaQueryListener>>();
  let viewportWidth = window.innerWidth || 1024;
  const parseWidthFromQuery = (
    query: string,
    kind: "max-width" | "min-width",
  ): number | null => {
    const match = query.match(new RegExp(`\\(${kind}:\\s*(\\d+)px\\)`));
    if (!match) {
      return null;
    }
    const parsed = Number.parseInt(match[1], 10);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const evaluateQuery = (query: string): boolean => {
    const max = parseWidthFromQuery(query, "max-width");
    const min = parseWidthFromQuery(query, "min-width");
    if (max != null && viewportWidth > max) {
      return false;
    }
    if (min != null && viewportWidth < min) {
      return false;
    }
    return true;
  };
  const dispatchMediaChanges = () => {
    for (const [query, listeners] of listenersByQuery.entries()) {
      const event = { matches: evaluateQuery(query), media: query } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    }
  };
  const setViewportWidth = (nextWidth: number) => {
    viewportWidth = nextWidth;
    Object.defineProperty(window, "innerWidth", {
      value: nextWidth,
      writable: true,
      configurable: true,
    });
    window.dispatchEvent(new Event("resize"));
    dispatchMediaChanges();
  };

  Object.defineProperty(window, "__setViewportWidth", {
    value: setViewportWidth,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => {
      if (!listenersByQuery.has(query)) {
        listenersByQuery.set(query, new Set());
      }
      const listeners = listenersByQuery.get(query)!;
      return {
        media: query,
        get matches() {
          return evaluateQuery(query);
        },
        onchange: null,
        addEventListener: (_type: string, callback: EventListenerOrEventListenerObject) => {
          if (typeof callback === "function") {
            listeners.add(callback as MediaQueryListener);
          }
        },
        removeEventListener: (_type: string, callback: EventListenerOrEventListenerObject) => {
          if (typeof callback === "function") {
            listeners.delete(callback as MediaQueryListener);
          }
        },
        addListener: (callback: EventListenerOrEventListenerObject) => {
          if (typeof callback === "function") {
            listeners.add(callback as MediaQueryListener);
          }
        },
        removeListener: (callback: EventListenerOrEventListenerObject) => {
          if (typeof callback === "function") {
            listeners.delete(callback as MediaQueryListener);
          }
        },
        dispatchEvent: () => true,
      };
    },
  });
}
