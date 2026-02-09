interface ImportMeta {
  glob(
    pattern: string | readonly string[],
    options?: Record<string, unknown>,
  ): Record<string, () => Promise<unknown>>;
}
