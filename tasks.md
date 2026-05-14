# Amanah Project Tasks & Progress

This document tracks the progress of the Amanah platform implementation according to the original PRD review and plan.

## Week 1 — Foundation

### Day 1–2: Monorepo & Nuxt Setup

- [x] Init Turborepo monorepo at project root
- [x] Create `apps/web` with Nuxt (upgraded to Nuxt 4) + TypeScript
- [x] Install: Pinia, Tailwind CSS, shadcn-vue, vueuse, and other core libraries
- [x] Set up Supabase project + local dev CLI
- [x] Configure `.env` with Supabase URL & anon key

### Day 3–4: Database Migrations

- [x] Write migration: `profiles`, `organizations`, `organization_members`
- [x] Write migration: `beneficiaries` (with `deleted_at`, soft delete support)
- [x] Write migration: `beneficiary_needs`
- [x] Write migration: `aid_distributions` (with `organization_id`)
- [x] Write migration: `donations`
- [x] Write migration: `audit_logs`
- [x] Enable `pg_trgm` extension and add GIN indexes on name/phone/national_id
- [x] Apply RLS policies

### Day 5: Auth

- [x] Login page (`/login`)
- [x] Signup page (`/signup`) with organization creation step (`/onboarding`)
- [x] Auth middleware (route guards)
- [x] Session persistence via Supabase JS client
- [ ] Password reset flow

---

## Week 2 — Core Features

### Day 6–7: Organization & Members

- [x] Create organization page
- [x] Organization settings page
- [x] Invite member by email (Supabase invite)
- [x] Member list with role display
- [ ] Role switcher for Admin

### Day 8–9: Beneficiary CRUD

- [x] Beneficiary list page with search & status filter
- [x] Add Beneficiary modal + full-page fallback
- [x] Beneficiary profile page (tabs: Info / Needs / History / Files / Notes)
- [ ] Edit Beneficiary
- [ ] Soft delete beneficiary

### Day 10: Needs System

- [x] Add Need modal from beneficiary profile
- [x] Active needs list in profile
- [ ] Edit / pause / complete need

---

## Week 3 — Distribution & Donations

### Day 11–12: Aid Distribution

- [x] Add Distribution modal (from beneficiary profile)
- [x] Distribution type + amount + date + proof upload
- [x] Chronological distribution timeline on profile
- [ ] Link distribution to a specific need

### Day 13: Donations

- [x] Donations list page
- [x] Add Donation form (donor name, amount, method, notes, anonymous flag)
- [x] Totals summary widget

### Day 14–15: Dashboard & Public Page

- [x] Dashboard with metric widgets
- [x] Upcoming recurring needs widget with quick actions
- [x] Public transparency page `/public/:slug` — aggregate stats only, no PII

---

## Week 4 — Polish & Deploy

### Day 16–17: Permissions & RLS

- [ ] Enforce Collector cannot delete beneficiaries
- [ ] Enforce Viewer is read-only
- [ ] Verify all RLS policies against all tables
- [ ] Frontend route guards per role

### Day 18: Audit Logging

- [ ] DB trigger or application-level logging for:
  - Beneficiary create/edit
  - Distribution create
  - Donation create
  - Member invite

### Day 19: Mobile Polish

- [x] Migrate all components to standard `shadcn-vue` for consistency and responsiveness
- [ ] Review all pages at 375px and 390px
- [ ] Ensure all forms are usable on mobile
- [ ] Tab layout on beneficiary profile works on small screens

### Day 20: Deployment

- [ ] Deploy Nuxt 4 to Vercel
- [ ] Finalize Supabase production project
- [ ] Apply all migrations to production
- [ ] Smoke test all core flows
