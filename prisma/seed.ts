import { PrismaClient, type RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ROLE_CAPABILITIES,
  CAPABILITIES,
  ROLES,
} from "../src/server/auth/capabilities";

const db = new PrismaClient();

async function main() {
  // 1) Company (single tenant for MVP)
  const company = await db.company.upsert({
    where: { id: "seed-company" },
    update: {},
    create: { id: "seed-company", name: "Tana's Bakery Shop" },
  });

  // 2) Permissions (from the capability catalog)
  for (const key of CAPABILITIES) {
    await db.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  // 3) Roles + role→permission mapping
  for (const roleName of ROLES) {
    const role = await db.role.upsert({
      where: { name: roleName as RoleName },
      update: {},
      create: { name: roleName as RoleName },
    });

    const caps =
      roleName === "ADMINISTRADOR" ? CAPABILITIES : ROLE_CAPABILITIES[roleName];
    for (const cap of caps) {
      const perm = await db.permission.findUnique({ where: { key: cap } });
      if (!perm) continue;
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // 4) Administrator user
  const adminEmail = "admin@tanasbakery.com";
  const passwordHash = await bcrypt.hash("Cambiar123!", 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Tana (Admin)",
      companyId: company.id,
      passwordHash,
    },
  });
  const adminRole = await db.role.findUnique({ where: { name: "ADMINISTRADOR" } });
  if (adminRole) {
    await db.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });
  }

  // 5) Tax rate — configurable DATA (not hardcoded).
  // Tana's Bakery is RIMPE Negocio Popular: it does NOT charge IVA (0%).
  await db.taxRate.upsert({
    where: {
      companyId_code_effectiveFrom: {
        companyId: company.id,
        code: "SIN_IVA",
        effectiveFrom: new Date("2024-01-01T00:00:00Z"),
      },
    },
    update: {},
    create: {
      companyId: company.id,
      code: "SIN_IVA",
      name: "Sin IVA (RIMPE Negocio Popular)",
      percentage: "0.00",
      effectiveFrom: new Date("2024-01-01T00:00:00Z"),
    },
  });

  // 6) Business settings (configurable, not hardcoded)
  const settings: { key: string; value: unknown }[] = [
    { key: "orders.reservationCents", value: 1000 }, // $10 reservation
    { key: "orders.depositPercent", value: 50 }, // 50% deposit
    { key: "billing.taxCode", value: "SIN_IVA" },
    { key: "billing.taxPercent", value: 0 },
    { key: "billing.documentType", value: "NOTA_VENTA" },
    { key: "locale", value: "es-EC" },
    { key: "timezone", value: "America/Guayaquil" },
  ];
  for (const s of settings) {
    await db.setting.upsert({
      where: { companyId_key: { companyId: company.id, key: s.key } },
      update: {},
      create: { companyId: company.id, key: s.key, value: s.value as object },
    });
  }

  // 7) Billing config — RIMPE Negocio Popular, no IVA, Nota de Venta
  await db.billingConfig.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      ruc: "0924660293001",
      razonSocial: "Tana's Bakery Shop",
      nombreComercial: "Tana's Bakery Shop",
      taxpayerRegime: "RIMPE_NEGOCIO_POPULAR",
      obligadoContabilidad: false,
      environment: "TEST",
    },
  });

  console.log("✅ Seed completo. Admin: admin@tanasbakery.com / Cambiar123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
