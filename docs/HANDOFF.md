# HANDOFF.md — Tana's Bakery Shop ERP

**Official project checkpoint.** This document is self-contained: an engineer or AI
should be able to continue the project from here without any additional context.

- **Last updated:** 2026-07-09
- **Product:** Specialized ERP for a made-to-order bakery (Tana's Bakery Shop, Guayaquil, Ecuador).
- **Working language:** Code/docs in English; the business owner (Tana) is a non-technical
  Spanish speaker — always explain progress to her in plain Spanish. Spanish companion
  docs live in the Claude Project.
- **Source of truth:** `PROJECT.md` (Claude Project instructions) + `docs/ARCHITECTURE.md`
  + this file. Business rules must never be assumed — ask before implementing.

---

## 1. Current project status

**In progress — Phase 3 (Quotations) COMPLETE. Working continuously (no per-milestone
approval gates — the user asked to run straight through each whole process).**

Done since last checkpoint: full CRM (lead list/detail/create/edit/activities, customer
list/detail/addresses/tags/notes/timeline); visual system restyled to a minimalist
white + soft-pink, no-emoji theme; **Quotations module complete** (create with line items,
list, detail, status changes, and **accept → convert lead to customer**). **Business rule
correction:** the shop is **RIMPE Negocio Popular (RUC 0924660293001) — no IVA**; tax is
configured to 0% (data, not code) and document type is **Nota de Venta**. 49/49 unit tests
pass; flows validated against a real ephemeral PostgreSQL. Next process: **Pedidos (Orders)**.

--- (historical note below) ---
Earlier checkpoint: Phase 2 (CRM) Milestone 1 delivered and awaiting approval.

The database model is frozen and approved. The application foundation is approved.
CRM Milestone 1 (Lead List + Customer List) is implemented and tested (25/25 unit tests
green, filters validated against a real PostgreSQL) but **not yet approved** by the owner.
Do not start CRM Milestone 2 (Lead Details) until the owner approves Milestone 1.

**Process rule (must follow):** work milestone-by-milestone. For each milestone:
(1) business objective, (2) UI design, (3) API design, (4) implement, (5) test,
(6) STOP and wait for the owner's explicit approval. Never batch multiple milestones.

---

## 2. Completed phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 0 — Architecture & Design** | Full architecture review + `ARCHITECTURE.md` v2 (16 sections + 9 platform services + future-module map) | ✅ Approved |
| **Phase 1 — Foundation** | M1: DB schema + initial migration · M2: app foundation (auth, RBAC, tenant scoping, UI shell, CI, tests) | ✅ Approved |
| **Phase 2 — CRM** | M1: Lead List + Customer List | 🟡 Delivered, awaiting approval |

---

## 3. Completed modules / building blocks

- **Database model** — 45 tables, 29 enums, 58 FKs, 106 indexes. Migration validated by
  applying it to a real PostgreSQL instance + full-flow insert test. **Frozen.**
- **identity / auth** — Auth.js (Credentials), RBAC (roles + capability matrix), request
  context (userId/companyId/roles), tenant guard.
- **UI shell** — App Router layout, role-based navigation, dark mode, sign-in page,
  base primitives (Button, Select, EmptyState, Pagination), design tokens.
- **crm (partial — Milestone 1)** — Lead List + Customer List: filters, search, badges,
  tags, quick actions (change lead status, assign salesperson, add customer tag),
  empty states, responsive, pagination. Full hexagonal layering + public `index.ts`.
- **Seed** — company, roles, permissions, admin user, IVA 15% (configurable), business
  settings ($10 reservation, 50% deposit), billing config (SRI TEST).
- **CI** — GitHub Actions: lint, typecheck, unit tests + integration job with Postgres.

---

## 4. Pending modules

**CRM (continue here):** Lead Details (next) → Customer Details → Lead/Customer create+edit
forms → Lead conversion UI → Lead activities/timeline UI → CRM analytics.

**MVP business modules (approved order, after CRM):**
Quotations → Orders (incl. Payments + Delivery) → Production (incl. Tasks) → Calendar → Dashboard.

**Platform services (schema-ready, code pending):** media, notifications, jobs/queue
(pg-boss + worker), feature-flags (partial via seed), settings (partial via seed),
dashboard engine, global search, activity feed, integrations (WhatsApp/payments/SRI transport).

**Billing/SRI:** schema exists; ports + adapters (XML gen, signing, SRI transport, RIDE PDF,
email) pending. MVP does NOT submit to SRI.

**Deferred business modules (represented, not built):** Recipes, Inventory, Purchasing,
Costing, Finance, Marketing, AI, Reports.

---

## 5. Current architecture

- **Style:** Modular monolith on Next.js (App Router), one deployable + a separate worker
  process (`/workers`) for the future queue.
- **Per-module layering (hexagonal):** `domain` (pure TS, no framework) → `application`
  (use-case factories depending on ports) → `infrastructure` (Prisma repos, adapters) →
  `ui`. Public API only via each module's `index.ts` (enforced by ESLint boundary rules).
- **Cross-module comms (planned):** synchronous via public use cases; asynchronous via an
  in-process domain event bus + background queue. **Event bus not yet implemented.**
- **Reads:** React Server Components call use cases directly. **Writes:** Server Actions →
  use cases. Interactive client state via TanStack Query (planned where needed).
- **Security:** authorization is authoritative in the application layer (`authorize(ctx, cap)`);
  middleware guards routes; UI hiding is UX only. Every query tenant-scoped by `companyId`.
- **Validation:** Zod at every boundary; domain invariants inside entities/value objects.
- **Money:** integer cents (USD) via `Money` value object. **Time:** UTC stored, `America/Guayaquil` shown.
- Full detail in `docs/ARCHITECTURE.md` (§1–§25).

---

## 6. Current database status

- **Engine:** PostgreSQL. **ORM:** Prisma. **IDs:** `cuid()`. **Money:** integer cents.
- **Schema:** `prisma/schema.prisma`. **Migration:** `prisma/migrations/20260709000000_init/migration.sql`
  (hand-authored because the build sandbox cannot download the Prisma engine; **validated by
  applying to a real PostgreSQL** — 0 errors, full-flow insert + FK enforcement verified).
- **Multi-tenancy:** `companyId` on all tenant-scoped tables; single company in MVP.
- **State machines (separate):** Order (commercial), Production (operational), Payment (independent), Delivery.
- **Snapshots:** orders store immutable customer + delivery snapshots; `OrderItem.unitCostCents`
  reserved for future costing.
- **CRM:** Lead → Quotation → Customer → Order. **Conversion rule:** a Lead becomes a Customer
  when the FIRST quotation is accepted OR the FIRST deposit/payment is received (whichever first);
  NOT after a completed order. Fields: `Lead.convertedAt`, `Lead.convertedCustomerId`,
  `Customer.becameCustomerAt`. Idempotent (see `docs/flujo-conversion-lead-cliente.md`).
- **Billing/SRI:** tables present (`ElectronicDocument`, `TaxRate`, `DocumentSequence`,
  `BillingConfig`) but no submission logic. IVA 15% stored as data in `TaxRate`.
- **NOT YET:** the migration has not been applied to a persistent production/staging DB.
  Run `prisma migrate deploy` in the target environment. Prisma has not been formally
  registered via `migrate dev` (do this once to let Prisma adopt the hand-written migration).

---

## 7. Decisions made (decision log)

1. **Stack:** Next.js (App Router) + TypeScript + PostgreSQL + Prisma + Tailwind + shadcn-style
   UI + React Hook Form + Zod + TanStack Query + Auth.js. Modular monolith.
2. **MVP modules:** Auth, User Mgmt, CRM, Quotations, Orders, Production, Calendar, Dashboard.
   Deferred: Recipes, Inventory, Purchasing, Costing, Finance, Marketing, AI, Reports.
3. **Multi-company ready** (`companyId`) from day 1; single tenant in MVP; no billing/signup yet.
4. **SRI e-invoicing** designed from day 1, behind ports; MVP does not submit. No Ecuador rules
   hardcoded — tax/config live in data (`TaxRate`, `BillingConfig`, `Setting`).
5. **Pricing:** catalog-based for MVP; recipe costing later; schema kept costing-ready.
6. **Payments:** $10 reservation, 50% deposit, full payment; balance tracked; payment
   confirmation (`confirmedById`/`confirmedAt`).
7. **Delivery:** pickup / internal / third-party; snapshot on order.
8. **Money as integer cents**; **UTC + America/Guayaquil**.
9. **RBAC enforced server-side** in the application layer; capability strings.
10. **CRM Leads before Customers**; conversion rule as in §6.
11. **Platform capabilities** added to architecture: integrations, media, notifications,
    jobs, feature-flags, settings, dashboard engine, global search, activity feed.
12. **Auth sessions:** JWT strategy (Auth.js Credentials constraint) — see technical debt.
13. **Password hashing:** bcrypt now, behind a `PasswordHasher` interface; Argon2id is the
    intended production algorithm.

---

## 8. Technical debt

- **Auth DB-session revocation** not implemented (using JWT strategy because Auth.js Credentials
  provider only supports JWT out of the box). Architecture calls for revocable DB sessions —
  add a custom session store later. (`src/server/auth/config.ts`)
- **Argon2id** not wired; bcrypt used behind `PasswordHasher`. Swap implementation only.
- **Audit log middleware** (Prisma `$extends` for CREATE/UPDATE/DELETE) not implemented yet;
  `AuditLog` table exists. `OrderStatusHistory`/`ProductionStatusHistory`/`LeadActivity` exist.
- **Domain event bus** not implemented; cross-module flows (QuotationAccepted → convert Lead,
  OrderConfirmed → create ProductionOrder) are documented, not coded.
- **MFA** fields provisioned (`User.mfaSecret`) but not enforced for ADMINISTRADOR.
- **Platform services** are schema-only (except settings/feature-flags seeded); no media/jobs/
  notifications/search/activity/dashboard-engine code yet.
- **Lead "Nuevo" button** is disabled (creation is a future milestone).
- **Pagination** is offset-based; fine for MVP, revisit for large datasets.
- **Prisma `migrate dev`** has not adopted the hand-written init migration; do this in a
  networked environment so Prisma's migration history matches.
- **No end-to-end / integration tests executed** in this environment (needs generated Prisma
  client). CI is configured to run them; run locally to confirm.

---

## 9. Known limitations (of the build environment used so far)

- The build sandbox **cannot download the Prisma engine** (`binaries.prisma.sh` blocked) and has
  **no persistent database**, so `prisma generate`, `next build`, full `tsc`, and `next dev`
  could not be run here. Verification strategy used instead: **unit tests via Vitest (25/25
  passing)** for pure logic (Money, RBAC, filters, where-builders) and **applying the migration +
  queries against an ephemeral real PostgreSQL**. In a normal dev environment everything runs
  with the standard commands (§12).
- Global search is PostgreSQL `ILIKE` (adequate for MVP); a dedicated search engine is future.

---

## 10. Next milestone (exact)

**CRM Milestone 2 — Lead Details** (only after the owner approves Milestone 1).

Suggested scope to design → build → test → stop for approval:
- Lead detail page `/leads/[id]`: full profile (source, status, assigned salesperson, contact,
  last contact, next follow-up), inline edit, status change with reason.
- Lead **activities/timeline** (`LeadActivity`): log calls / WhatsApp / notes; show chronologically.
- **Create/edit Lead** form (enable the currently-disabled "Nuevo lead" button) with Zod validation.
- Wire quick actions to also append `LeadActivity` and, where relevant, `CustomerTimelineEntry`.
- Respect: `authorize` (`leads:read`/`leads:write`), tenant scoping, Server Actions, RSC reads.

---

## 11. Folder structure

```
tanas-bakery-erp/
├─ docs/
│  ├─ ARCHITECTURE.md                 # full technical architecture (§1–§25)
│  ├─ flujo-conversion-lead-cliente.md# Lead→Customer conversion workflow
│  └─ HANDOFF.md                      # this file
├─ prisma/
│  ├─ schema.prisma                   # full data model (frozen)
│  ├─ migrations/20260709000000_init/migration.sql
│  ├─ migrations/migration_lock.toml
│  └─ seed.ts                         # company, roles, permissions, admin, tax, settings
├─ src/
│  ├─ app/
│  │  ├─ (auth)/sign-in/              # sign-in page + action + client form
│  │  ├─ (app)/                       # protected shell (layout, sign-out action)
│  │  │  ├─ dashboard/  leads/  clientes/   # leads & clientes: page.tsx + actions.ts
│  │  ├─ api/auth/[...nextauth]/route.ts
│  │  ├─ layout.tsx  page.tsx  globals.css
│  ├─ modules/
│  │  ├─ shared/domain/               # Money, Result, errors (pure kernel) + tests
│  │  └─ crm/
│  │     ├─ domain/types.ts           # pure CRM types/enums
│  │     ├─ application/              # filters (Zod), ports, use-cases + tests
│  │     ├─ infrastructure/           # prisma repos + where-builders + tests
│  │     ├─ ui/                       # tables, toolbars, badges, quick actions, labels
│  │     └─ index.ts                  # PUBLIC API (composition root)
│  ├─ server/                         # db, auth (config/context/password/capabilities/authorize),
│  │                                  #   context, tenant, logger
│  ├─ components/                     # theme provider/toggle, ui/{button,select,empty-state,pagination}
│  └─ lib/                            # cn, nav (role-based)
├─ workers/index.ts                   # background worker entrypoint (queue: future)
├─ .github/workflows/ci.yml
├─ middleware.ts                      # route protection
├─ eslint.config.mjs                  # module-boundary + pure-domain rules
├─ tsconfig.json  next.config.mjs  tailwind.config.ts  postcss.config.mjs  vitest.config.ts
├─ .env.example  .gitignore  package.json  README.md
```

Module internals (`domain`/`application`/`infrastructure`/`ui`) are private; import a module
only via its `index.ts`.

---

## 12. Current technology stack

| Layer | Tech |
|-------|------|
| Language | TypeScript (strict) |
| Framework | Next.js 15 (App Router), React 19 |
| DB | PostgreSQL |
| ORM | Prisma 5 |
| Auth | Auth.js v5 (NextAuth beta), JWT sessions, bcryptjs (Argon2id intended) |
| UI | Tailwind CSS, shadcn-style primitives, next-themes (dark mode) |
| Forms/validation | React Hook Form + Zod |
| Client data | TanStack Query (as needed) |
| Background jobs | pg-boss + worker process (planned) |
| Logging | pino |
| Testing | Vitest (unit); Playwright (e2e, planned) |
| CI | GitHub Actions (lint, typecheck, test, Postgres integration) |

### Run commands (in a normal environment)
```bash
cp .env.example .env          # set DATABASE_URL + AUTH_SECRET (npx auth secret)
npm install
npx prisma generate
npx prisma migrate deploy     # or: npx prisma migrate dev --name init (first time, to adopt)
npm run db:seed
npm run dev                   # http://localhost:3000
npm run test                  # 25/25 unit tests
```
Seed admin: `admin@tanasbakery.com` / `Cambiar123!` (change immediately).

---

## 13. Development roadmap

- **Phase 0 — Architecture & Design** ✅
- **Phase 1 — Foundation** ✅ (M1 DB, M2 app foundation)
- **Phase 2 — CRM** 🟡 (M1 lists delivered/awaiting approval → M2 Lead Details → Customer
  Details → create/edit → conversion UI → activities/timeline → analytics)
- **Phase 3 — Quotations**
- **Phase 4 — Orders** (payments, delivery)
- **Phase 5 — Production** (tasks, kanban)
- **Phase 6 — Calendar**
- **Phase 7 — Dashboard** (dashboard engine + role KPIs)
- **Phase 8 — Platform hardening** (audit middleware, event bus, jobs/worker, notifications,
  media, global search, activity feed, MFA, DB-session revocation)
- **Phase 9 — Billing/SRI** (XML, signing, transport, RIDE, email)
- **Phase 10 — SaaS productization** (activate multi-tenant, billing, onboarding) — only after
  validation in Tana's shop.

---

## 14. Exact starting point for the next session

1. **Read, in order:** `PROJECT.md` (Project instructions) → `docs/ARCHITECTURE.md` →
   `docs/flujo-conversion-lead-cliente.md` → this `HANDOFF.md`. Also review the Spanish
   companion docs in the Claude Project (`fase-1/*`, `fase-2/*`) for owner-facing context.
2. **Get the code:** the latest full source was delivered as `tanas-bakery-erp.zip`. If a Git
   repo exists, clone it; otherwise unzip the latest artifact. (Recommendation: put the code in
   a Git repository so future sessions start from real code, not a zip.)
3. **Confirm approval state:** CRM Milestone 1 was awaiting the owner's approval at checkpoint
   time. If the owner has approved it, proceed to **CRM Milestone 2 — Lead Details** (§10). If
   not, address any Milestone 1 feedback first. Do not skip the approval gate.
4. **Follow the process:** design (business/UI/API) → implement in the `crm` module respecting
   layering + `authorize` + tenant scoping → add Vitest tests for pure logic → validate against
   a real PostgreSQL if possible → STOP and present the milestone to the owner in plain Spanish,
   then wait for approval.
5. **Environment note:** if the runtime can reach `binaries.prisma.sh` and a database, run the
   standard commands (§12) — `prisma generate`, `migrate`, `dev`, `build` all work there. The
   prior sandbox could not, which is why verification relied on unit tests + ephemeral Postgres.
6. **Always** explain progress to Tana in simple Spanish, and end each milestone with:
   what was implemented, architectural decisions, trade-offs, and a request for approval.
```
