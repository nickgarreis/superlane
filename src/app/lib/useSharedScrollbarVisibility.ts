import { useEffect } from "react";

const SCROLLABLE_SELECTOR = [
  "html",
  ".overflow-y-auto",
  ".overflow-auto",
  ".overflow-x-auto",
  ".custom-scrollbar",
  ".scrollbar-hide",
  ".app-scrollbar",
].join(", ");

const SCROLLBAR_ACTIVE_CLASS = "scrollbar-active";
const SCROLLBAR_IDLE_DELAY_MS = 720;

const resolveScrollHost = (target: EventTarget | null): HTMLElement | null => {
  if (
    target === document ||
    target === document.documentElement ||
    target === document.body
  ) {
    return document.documentElement;
  }

  if (!(target instanceof HTMLElement)) {
    return null;
  }

  if (target.matches(SCROLLABLE_SELECTOR)) {
    return target;
  }

  return target.closest<HTMLElement>(SCROLLABLE_SELECTOR);
};

export function useSharedScrollbarVisibility() {
  useEffect(() => {
    const activeTimers = new Map<HTMLElement, number>();

    const markScrollbarActive = (host: HTMLElement) => {
      host.classList.add(SCROLLBAR_ACTIVE_CLASS);
      const previousTimer = activeTimers.get(host);
      if (previousTimer !== undefined) {
        window.clearTimeout(previousTimer);
      }

      const timer = window.setTimeout(() => {
        host.classList.remove(SCROLLBAR_ACTIVE_CLASS);
        activeTimers.delete(host);
      }, SCROLLBAR_IDLE_DELAY_MS);

      activeTimers.set(host, timer);
    };

    const handleScroll = (event: Event) => {
      const host = resolveScrollHost(event.target);
      if (!host) {
        return;
      }

      markScrollbarActive(host);
    };

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll, true);

      for (const [host, timer] of activeTimers.entries()) {
        window.clearTimeout(timer);
        host.classList.remove(SCROLLBAR_ACTIVE_CLASS);
      }
      activeTimers.clear();
    };
  }, []);
}
