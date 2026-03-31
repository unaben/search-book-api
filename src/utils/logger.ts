export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const getCurrentLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel;
  }
  return "info";
};

const CURRENT_LOG_LEVEL = getCurrentLogLevel();

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const serializeError = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};

const normalizeContext = (
  context?: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!context) return undefined;
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, serializeError(value)])
  );
};

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({
      level: "error",
      message: "Failed to serialize log entry",
      timestamp: new Date().toISOString(),
    });
  }
};

const log = (
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): void => {
  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[CURRENT_LOG_LEVEL]) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context: normalizeContext(context) }),
  };

  const output = safeStringify(entry) + "\n";

  if (level === "error" || level === "warn") {
    process.stderr.write(output);
  } else {
    process.stdout.write(output);
  }
};

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    log("error", message, context),
};