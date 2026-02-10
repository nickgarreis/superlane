import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

type DropdownPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  placement: "above" | "below";
};

export function useDropdownPosition(
  editorRef: RefObject<HTMLElement | null>,
  dropdownRef: RefObject<HTMLDivElement | null>,
  isOpen: boolean,
) {
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const rafRef = useRef<number | null>(null);

  const cancelScheduledMeasure = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const measureNow = useCallback(() => {
    const editorElement = editorRef.current;
    if (!editorElement || !isOpen) {
      setPosition(null);
      return;
    }

    const rect = editorElement.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 260;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= dropdownHeight + gap) {
      setPosition({ top: rect.bottom + gap, left: rect.left, width: rect.width, placement: "below" });
      return;
    }

    if (spaceAbove >= dropdownHeight + gap) {
      setPosition({ bottom: window.innerHeight - rect.top + gap, left: rect.left, width: rect.width, placement: "above" });
      return;
    }

    if (spaceBelow >= spaceAbove) {
      setPosition({ top: rect.bottom + gap, left: rect.left, width: rect.width, placement: "below" });
      return;
    }

    setPosition({ bottom: window.innerHeight - rect.top + gap, left: rect.left, width: rect.width, placement: "above" });
  }, [dropdownRef, editorRef, isOpen]);

  const scheduleMeasure = useCallback(() => {
    if (!isOpen) {
      return;
    }
    cancelScheduledMeasure();
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      measureNow();
    });
  }, [cancelScheduledMeasure, isOpen, measureNow]);

  useLayoutEffect(() => {
    if (!isOpen) {
      cancelScheduledMeasure();
      setPosition(null);
      return;
    }

    measureNow();
  }, [cancelScheduledMeasure, isOpen, measureNow]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    scheduleMeasure();

    const handleViewportChange = () => scheduleMeasure();
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
      cancelScheduledMeasure();
    };
  }, [cancelScheduledMeasure, isOpen, scheduleMeasure]);

  return position;
}
