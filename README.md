# Tana's Bakery Shop ERP

ERP especializado para pastelería. Monolito modular · Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Auth.js · Tailwind + shadcn-style UI.

Ver `docs/` y el Proyecto para la arquitectura (`ARCHITECTURE.md`) y los flujos de negocio.

## Requisitos
- Node 20+
- PostgreSQL 16+

## Puesta en marcha
```bash
cp .env.example .env          # configura DATABASE_URL y AUTH_SECRET (npx auth secret)
npm install
npx prisma migrate deploy     # crea las tablas (migración inicial ya incluida)
npm run db:seed               # empresa, roles, permisos, admin, IVA 15%, settings
npm run dev                   # http://localhost:3000
```

Admin de prueba (tras el seed): `admin@tanasbakery.com` / `Cambiar123!`

## Scripts
- `npm run dev` · servidor de desarrollo
- `npm run build` / `npm start` · producción
- `npm run lint` · ESLint (incluye reglas de fronteras entre módulos)
- `npm run typecheck` · TypeScript estricto
- `npm run test` · Vitest (unitarios)
- `npm run worker` · proceso de trabajos en segundo plano (pg-boss, futuro)

## Estructura
```
src/
  app/            Next.js App Router — (auth) público, (app) protegido
  modules/        contextos de negocio (shared kernel presente; el resto en próximos hitos)
  platform/       servicios transversales (media, jobs, search… próximos hitos)
  server/         infraestructura transversal: db, auth, contexto, tenant, logger
  components/     UI (primitivos shadcn-style, theme)
  lib/            utilidades (cn, navegación por rol)
workers/          entrypoint del worker
prisma/           schema + migración inicial + seed
```

## Estado
Fase 1 · Hito 2 (Fundación): autenticación, RBAC, alcance por empresa, UI shell con modo oscuro,
tests y CI. La lógica de negocio de cada módulo llega en los siguientes hitos.
