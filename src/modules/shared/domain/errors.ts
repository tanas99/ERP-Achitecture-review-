/**
 * Domain error taxonomy (ARCHITECTURE.md §10). Errors carry a stable `code`
 * so presentation can map them to Spanish messages / HTTP statuses. Never throw
 * bare strings.
 */
export type ErrorCode =
  | "VALIDATION"
  | "DOMAIN_RULE"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "INFRASTRUCTURE";

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "No autorizado") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "No encontrado") {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}
