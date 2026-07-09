/**
 * Result — discriminated union used by the application layer to return outcomes
 * without throwing (ARCHITECTURE.md §7/§10). Presentation maps it to UI/HTTP.
 */
export type Ok<T> = { ok: true; data: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}
