import { db } from "@/server/db";
import type { RequestContext } from "@/server/context";
import type { DirectoryRepository } from "@/modules/crm/application/ports";
import type { AssignedUser, TagRef } from "@/modules/crm/domain/types";

export class PrismaDirectoryRepository implements DirectoryRepository {
  async assignableUsers(ctx: RequestContext): Promise<AssignedUser[]> {
    const users = await db.user.findMany({
      where: {
        companyId: ctx.companyId,
        isActive: true,
        deletedAt: null,
        roles: { some: { role: { name: { in: ["VENTAS", "ADMINISTRADOR"] } } } },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return users;
  }

  async tags(ctx: RequestContext): Promise<TagRef[]> {
    const tags = await db.tag.findMany({
      where: { companyId: ctx.companyId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });
    return tags;
  }
}
