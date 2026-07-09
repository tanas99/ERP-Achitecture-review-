import type { RequestContext } from "@/server/context";
import { UnauthorizedError } from "@/modules/shared/domain/errors";
import {
  ROLE_CAPABILITIES,
  type Capability,
  type Role,
} from "@/server/auth/capabilities";

/** True if any of the context's roles grants the capability. Admin gets all. */
export function can(
  ctx: Pick<RequestContext, "roles">,
  capability: Capability,
): boolean {
  return ctx.roles.some((role: Role) => {
    if (role === "ADMINISTRADOR") return true;
    return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
  });
}

/**
 * Authoritative server-side guard. Throws UnauthorizedError if the capability is
 * missing. Call at the start of every write use case.
 */
export function authorize(
  ctx: Pick<RequestContext, "roles">,
  capability: Capability,
): void {
  if (!can(ctx, capability)) {
    throw new UnauthorizedError(
      `Falta el permiso "${capability}" para esta acción.`,
    );
  }
}
