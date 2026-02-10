export const safeScrollIntoView = (
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions | boolean,
) => {
  if (!element || typeof element.scrollIntoView !== "function") {
    return;
  }

  if (options === undefined) {
    element.scrollIntoView();
    return;
  }

  element.scrollIntoView(options);
};
