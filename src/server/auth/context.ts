import { auth } from "@/server/auth/config";
import type { RequestContext } from "@/server/context";
import { UnauthorizedError } from "@/modules/shared/domain/errors";

/**
 * Resolve the RequestContext from the current Auth.js session. Use at the top of
 * protected server actions / route handlers so authorization and the tenant
 * guard have userId, companyId and roles.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError("Sesión no válida. Inicia sesión de nuevo.");
  }
  return {
    userId: session.user.id,
    companyId: session.user.companyId,
    roles: session.user.roles,
  };
}
