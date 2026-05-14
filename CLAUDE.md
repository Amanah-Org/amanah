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

Custom Tailwind tokens: `brand-*` (green palette), `surface-*` (grey neutrals), `shadow-card`, `shadow-card-hover`.

### Audit Logging

All write operations should call `useAuditLog().logAction(action, entityType, entityId?, metadata?)`. This inserts into the `audit_logs` table with the current user and org automatically attached.

### Auth Flow

Supabase Auth handles authentication. Protected routes redirect to `/login`; public routes (listed in `nuxt.config.ts` under `supabase.redirectOptions.exclude`) skip the auth guard. The `/invite/accept` page handles team invitation acceptance. A Postgres trigger auto-creates a `profiles` row on every new `auth.users` insert.

### Shared Types

All domain types and form interfaces are in `packages/types/index.ts` and imported as `@amanah/types`. Do not duplicate type definitions in the app — add them to the package instead.
