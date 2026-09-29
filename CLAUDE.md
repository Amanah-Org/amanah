# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands can be run from the repo root via Turborepo, or from `apps/web` directly.

```bash
# Install dependencies (run from root)
npm install

# Development server (http://localhost:3000)
npm run dev
# or: cd apps/web && npm run dev
# against local Supabase (apps/web/.env.local): cd apps/web && npm run dev:local

# Production build
npm run build

# Lint
npm run lint
# or: cd apps/web && npm run lint

# Format
npm run format
```

There are no tests configured yet.

### Environment Setup

Copy `apps/web/.env.example` to `apps/web/.env` and fill in:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database

Apply migrations via Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Migrations live in `supabase/migrations/` and must be run in order.

For local development, `npx supabase start` (Docker) runs the stack and applies migrations plus `supabase/seed.sql` (demo org with admin/collector/viewer users). `npx supabase db reset` rebuilds it. Regenerate `apps/web/app/types/database.types.ts` with `npx supabase gen types typescript --local --schema public` after schema changes.

## Architecture

### Monorepo Layout

- `apps/web` — Nuxt 3 web application (the only app)
- `packages/types` — shared TypeScript types imported as `@amanah/types`
- `supabase/migrations/` — SQL schema migrations with RLS policies

### Nuxt 4 Compatibility Mode

The app uses `future: { compatibilityVersion: 4 }`, so the source root is `apps/web/app/` (not `apps/web/`). Pages, layouts, composables, stores, plugins, and assets all live under `apps/web/app/`.

### Multi-Tenancy Model

Every data table has an `organization_id` column. Row Level Security (RLS) on Supabase enforces that users can only access rows belonging to their organization. Each user belongs to one organization with one of three roles: `admin`, `collector`, or `viewer`.

The active organization and role are loaded once at app start by `app/plugins/org.client.ts` into `useOrgStore` (Pinia). All data queries should read `orgStore.currentOrgId` to scope requests.

### Data Access Patterns

- **Client-side queries**: use `useSupabaseClient()` from `@nuxtjs/supabase` directly in pages/composables, scoped by `currentOrgId`
- **Server-side privileged operations** (e.g., sending invites): use `server/utils/supabaseAdmin.ts` which constructs a service-role client; these run in `server/api/` Nitro handlers
- TanStack Vue Query (`@tanstack/vue-query`) is set up via `app/plugins/vue-query.ts` but currently used selectively

### UI Components

shadcn-vue components (built on reka-ui) live in `app/components/ui/`. They use the prefix-less config (`shadcn.prefix: ""`). Add new shadcn components via `npx shadcn-vue@latest add <component>` from `apps/web`.

Design tokens live in `apps/web/tailwind.config.ts` (ramps) and `app/assets/css/main.css` (semantic roles as RGB channels). Primary is `brand-600` (#075e46); the page ground is `canvas` (= `brand-50`, #e8fff2) with white `surface-0` cards on it. Use these, never raw Tailwind `slate`/`red`/`amber`/`blue` or hex literals:

- `brand-*` primary ramp; `ink-*` green-tinted neutral for text (400 is the lightest AA text step, use it for metadata and placeholders); `surface-*` fills and hairlines
- `danger-*`, `warning-*`, `info-*` status ramps (success is the brand green); `shadow-card`, `shadow-card-hover`, `shadow-dialog`
- Focus is one global `:focus-visible` outline in `main.css`; do not add per-component ring utilities
- Direction-safe utilities only (`ps-`/`pe-`/`start-`/`end-`/`text-start`/`border-e`); Arabic type rules are in `main.css` under `html[lang='ar']`
- Native `<select>` takes the shared `.input` class; the shadcn `ui/` primitives and the `.btn-*`/`.card`/`.input` classes share one recipe, so change both together

### Roles in the UI

`useOrgStore()` exposes `isAdmin` and `canWrite` (admin or collector). Hide write actions from viewers with `canWrite`; admin-only actions (delete beneficiary, member management, org settings) with `isAdmin`. RLS and triggers are the real enforcement.

### Database Business Logic (migration 008)

- Sort needs by `urgency_rank` (generated column), never by the `urgency` text.
- `need_schedule` view (security_invoker) gives each need's `last_distribution_date` / `next_due_date`.
- `org_summary(org_id)` RPC returns dashboard/donation totals. Don't sum rows client-side (PostgREST caps responses at 1000 rows).
- Soft-delete beneficiaries via the `soft_delete_beneficiary` RPC. A plain UPDATE of `deleted_at` fails RLS, and non-admins are blocked by a trigger.
- Server endpoints check membership with `requireOrgMember(event, orgId, roles?)` from `server/utils/orgAccess.ts`.

### Writes, Offline & Feedback

Field workers lose signal, so user-entered records go through `useOfflineWrite()` (backed by `stores/outbox.ts`), not `supabase.from(...).insert/update` directly:

- `insert(table, row, label)` / `update(table, id, values, label)` write immediately when possible, otherwise queue on the device (localStorage, per user) and replay in order on reconnect or every 20s. Inserts must carry a client id (`crypto.randomUUID()`) so replays are idempotent and later rows can reference them.
- `write.confirm(result, message)` shows the right toast ("Saved" vs "saved on this device"); `useToast()` for other confirmations.
- `useAuditLog().logAction` is queued the same way.
- Deletes and file uploads need a connection. Check `useOutboxStore().online` and say so.
- For page reads, add `...keepWhenOffline` to `useAsyncData` options and wrap the result with `keepOnNetworkError(nuxtApp, key, res, value)` (both in `app/utils/offline.ts`) so pages keep their data instead of going blank.

### Formatting & i18n

Use `useFormat()` for dates, money, enum labels (`label('needType', v)`) and badge classes, and `localToday()` for date-input defaults (not `toISOString()`, which gives the UTC date). Every user-facing string needs keys in both `en.json` and `ar.json`. Counted strings use `t(key, { n }, n)`; Arabic versions list six forms (zero | one | two | few | many | other, see `app/i18n/i18n.config.ts`), English two.

### Audit Logging

All write operations should call `useAuditLog().logAction(action, entityType, entityId?, metadata?)`. This inserts into the `audit_logs` table with the current user and org automatically attached.

### Auth Flow

Supabase Auth handles authentication. Protected routes redirect to `/login`; public routes (listed in `nuxt.config.ts` under `supabase.redirectOptions.exclude`) skip the auth guard. The `/invite/accept` page handles team invitation acceptance. A Postgres trigger auto-creates a `profiles` row on every new `auth.users` insert.

### Shared Types

All domain types and form interfaces are in `packages/types/index.ts` and imported as `@amanah/types`. Do not duplicate type definitions in the app — add them to the package instead.
