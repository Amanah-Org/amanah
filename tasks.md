# Amanah Project Tasks & Progress

This document tracks the progress of the Amanah platform implementation against the PRD (`PRD.md`).

## Week 1 — Foundation

### Day 1–2: Monorepo & Nuxt Setup

- [x] Init Turborepo monorepo at project root
- [x] Create `apps/web` with Nuxt (upgraded to Nuxt 4) + TypeScript
- [x] Install: Pinia, Tailwind CSS, shadcn-vue, vueuse, and other core libraries
- [x] Set up Supabase project + local dev CLI (`supabase/config.toml`, `npm run dev:local`)
- [x] Configure `.env` with Supabase URL & anon key
- [x] Dev seed data (`supabase/seed.sql`: demo org + admin / collector / viewer users)
- [x] Generated database types (`app/types/database.types.ts`)

### Day 3–4: Database Migrations

- [x] Write migration: `profiles`, `organizations`, `organization_members`
- [x] Write migration: `beneficiaries` (with `deleted_at`, soft delete support)
- [x] Write migration: `beneficiary_needs`
- [x] Write migration: `aid_distributions` (with `organization_id`)
- [x] Write migration: `donations`
- [x] Write migration: `audit_logs`
- [x] Enable `pg_trgm` extension and add GIN indexes on name/phone/national_id
- [x] Apply RLS policies
- [x] `beneficiary_notes`, `need_schedule` view, `org_summary` RPC (008)

### Day 5: Auth

- [x] Login page (`/login`)
- [x] Signup page (`/signup`) with organization creation step (`/onboarding`)
- [x] Auth middleware (route guards)
- [x] Session persistence via Supabase JS client
- [x] Password reset flow (`/forgot-password`, `/reset-password`)
- [x] Email-confirmation callback (`/confirm`) and "check your email" state on signup
- [x] Return to the requested page after login
- [x] Auth errors translated; expired reset links detected; language switcher on auth screens
- [x] Onboarding: slug for non-Latin (Arabic) names, slug validated server-side, sign-out escape

---

## Week 2 — Core Features

### Day 6–7: Organization & Members

- [x] Create organization page
- [x] Organization settings page (rename, public page link)
- [x] Invite member by email (`POST /api/invites`, Supabase invite for new accounts)
- [x] Invitation acceptance incl. password setup for new accounts (`/invite/accept`)
- [x] Member list with role display
- [x] Role switcher / remove member / revoke invite for admins
- [x] Multiple organizations per user: org switcher, remembered choice, accept lands in the new org
- [x] Pending-invitation banner for users who already belong to an organization

### Day 8–9: Beneficiary CRUD

- [x] Beneficiary list page with search & status filter
- [x] List columns: last support date, active needs; pagination
- [x] Add Beneficiary modal (opens the new profile after saving)
- [x] Beneficiary profile page (tabs: Info / Needs / History / Files / Notes)
- [x] Edit Beneficiary (incl. status, birth date, employment)
- [x] Soft delete beneficiary (admins only, `soft_delete_beneficiary` RPC)
- [x] Possible-duplicate warning on registration (same national ID or phone, format-insensitive)
- [x] Blank / whitespace-only names rejected (form + DB constraint)
- [ ] `/beneficiaries/new` full-page fallback (the modal is used on all screen sizes)

### Day 10: Needs System

- [x] Add Need modal from beneficiary profile
- [x] Needs list in profile with last-given / next-due dates
- [x] Edit / pause / complete need

---

## Week 3 — Distribution & Donations

### Day 11–12: Aid Distribution

- [x] Add Distribution modal (from beneficiary profile)
- [x] Distribution type + amount + date + proof upload
- [x] Distribution timeline on profile, grouped by month
- [x] Link distribution to a specific need (auto-complete for one-time needs)
- [x] Duplicate-aid warning (same type within 30 days)
- [x] Admins can delete a distribution (due dates and totals recalculate)

### Day 13: Donations

- [x] Donations list page
- [x] Add Donation form (donor name, amount, method, notes, anonymous flag)
- [x] Totals summary widget (server-side totals)
- [x] Admins can delete a donation

### Day 14–15: Dashboard & Public Page

- [x] Dashboard with all PRD metric widgets
- [x] Due / overdue recurring needs widget with "Record" quick action
- [x] Public transparency page `/public/:slug` — aggregate stats only, no PII
- [x] Landing page (hero, features, transparency, CTA)
- [x] First-run "getting started" card on an empty dashboard; due list first on phones

---

## Week 4 — Polish & Deploy

### Day 16–17: Permissions & RLS

- [x] Enforce Collector cannot delete beneficiaries (DB trigger + RPC)
- [x] Enforce Viewer is read-only (RLS + write actions hidden in UI)
- [x] Verify all RLS policies against all tables (role matrix tested locally)
- [x] Frontend role guards (`orgStore.canWrite` / `orgStore.isAdmin`)
- [x] Private attachments bucket with per-org paths + signed URLs (006)
- [x] Audit log writes server-side only (007)

### Day 18: Audit Logging

- [x] Application-level logging via `POST /api/audit-log` for:
  - Beneficiary create/edit/delete
  - Need create/edit/status
  - Distribution create
  - Donation create
  - Member invite / role change / removal
- [x] Admin activity log in Settings

### Day 19: Mobile Polish

- [x] Migrate all components to standard `shadcn-vue` for consistency and responsiveness
- [x] Mobile card layout + empty/loading states on beneficiary list
- [x] Tab layout on beneficiary profile works on small screens
- [ ] Full review of every page at 375px and 390px on real devices

### Day 20: Deployment

- [ ] Deploy Nuxt 4 to Vercel
- [ ] Finalize Supabase production project (the previously linked project no longer resolves)
- [ ] Apply all migrations (001–008) to production
- [ ] Configure production Auth URLs (Site URL + redirect URLs for `/confirm`, `/invite/accept`, `/reset-password`)
- [ ] Smoke test all core flows

---

## Backlog — UX enhancements (from the user-flow review)

- [x] Shorter beneficiary form: essentials first, one-tap category chips, "more details" collapsed
- [x] Success toasts after saving
- [x] Edit distributions (admins; collectors record only, enforced by RLS) and donations, with before/after in the audit log
- [x] Arabic plural rules (CLDR zero/one/two/few/many/other) via `app/i18n/i18n.config.ts`
- [x] Offline tolerance: writes queue on the device and sync on reconnect; pages visited this session stay readable
- [ ] Org-wide distributions list / "view all" for due needs
- [ ] Installable app / service worker so the app itself opens with no connection (today the page must already be open)
- [ ] Offline photo proofs (store the file on the device until it can be uploaded)
