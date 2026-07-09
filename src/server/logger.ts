import pino from "pino";

/**
 * Structured JSON logger (ARCHITECTURE.md §12). Never log PII or secrets.
 * Attach correlationId / userId / companyId via child loggers per request.
 */
export const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  redact: ["req.headers.authorization", "*.passwordHash", "*.encryptedValue"],
});
