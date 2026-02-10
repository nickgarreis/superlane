type LogLevel = "error" | "info" | "warn";

type LogContext = Record<string, unknown> | undefined;

const writeLog = (level: LogLevel, scope: string, message: string, context?: LogContext) => {
  const payload = {
    scope,
    message,
    context: context ?? {},
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
};

export const logError = (scope: string, message: string, context?: LogContext) =>
  writeLog("error", scope, message, context);

export const logWarn = (scope: string, message: string, context?: LogContext) =>
  writeLog("warn", scope, message, context);

export const logInfo = (scope: string, message: string, context?: LogContext) =>
  writeLog("info", scope, message, context);
