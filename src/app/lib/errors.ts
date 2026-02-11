import { toast } from "sonner";
type ReportUiErrorOptions = {
  userMessage?: string;
  details?: Record<string, unknown>;
  showToast?: boolean;
};
const normalizeError = (
  error: unknown,
): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  return { message: "Unknown error" };
};
export const reportUiError = (
  scope: string,
  error: unknown,
  options: ReportUiErrorOptions = {},
) => {
  const normalized = normalizeError(error);
  const userMessage = options.userMessage?.trim();
  console.error(`[ui:${scope}] ${normalized.message}`, {
    error: normalized,
    details: options.details,
  });
  if (options.showToast !== false && userMessage) {
    toast.error(userMessage);
  }
};
