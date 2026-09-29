# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Amanah serves small and mid-size aid organizations: charities, mosques, community groups. They are Arabic-speaking first, and today they run on WhatsApp threads, paper records, Excel and Google Sheets.

Two first-class users, both equally important (confirmed):

- **Field collector / volunteer.** Registers a case or records a delivery on a phone, often with weak or no signal, often not technical. The job: get the entry saved in a few taps and trust that it was saved.
- **Coordinator / admin.** Runs the organization from a desk or a phone: sees which recurring needs are due or overdue, reviews beneficiaries and history, records donations, manages the team and roles. Read-only **viewers** (for example trustees) also exist.

Secondary audience (confirmed): **donors and community members** who read the public transparency page to decide whether to trust the organization. Beneficiaries are the subjects of the records, never users of the app.

## Product Purpose

A beneficiary and aid-distribution operating system: register beneficiaries, track recurring needs, record every distribution with proof, record donations, and show the organization's impact transparently. It is explicitly not a crowdfunding or payments platform. Success, per the PRD: organizations stop using spreadsheets, recurring needs stop being forgotten, duplicate aid stops, and the support history becomes operationally useful and trusted. Target: at least 3 active organizations with weekly staff use.

## Positioning

A tool built around the real failure modes of informal aid work, not a generic CRM: it warns before duplicate aid, keeps recurring needs (monthly rent, weekly medicine, yearly school fees) from slipping via due and overdue dates, keeps field entries safe when the signal drops, and gives donors a public page of aggregate impact with no personal data. It is Arabic-first with RTL as the native layout.

## Operating Context

- Daily operational use by non-technical staff and volunteers; the PRD ranks clarity over visual complexity and speed over fancy animation. Data entry should minimize clicks.
- Phone-first (mobile web), used in the field. Writes queue on the device and sync on reconnect. Deletes and file uploads need a connection, and the UI says so.
- Arabic-first with English fully supported. Arabic uses full RTL and six CLDR plural forms. Language switching is available everywhere, including auth screens.
- Multi-tenant: every record belongs to an organization, a user can belong to several, and roles are admin, collector and viewer. The database enforces roles and organization isolation; the UI mirrors them.
- Money is recorded, not moved. Donations are entered manually; currency defaults to USD in the schema and multi-currency handling is undecided.
- Core workflow: register beneficiary, add recurring needs, record distributions (cash or in-kind, with amount, date and proof photo), review due needs on the dashboard, log donations, publish the transparency page.

## Capabilities and Constraints

- Beneficiary profiles with info, needs, history, files and notes; search by name, phone or national ID; possible-duplicate warning at registration.
- Needs by type and frequency (one-time, weekly, monthly, yearly), urgency (low to critical), and status (active, paused, completed). Due and overdue dates are computed server-side.
- Distributions linked to needs, with proof upload and a duplicate-aid warning (same type within 30 days). Donations with anonymous flag and totals.
- Dashboard with beneficiary, financial and operational metrics; totals come from server-side aggregation, never summed client-side.
- Invitations, per-role permissions, audit log of important actions.
- Stack is fixed by the existing codebase (Nuxt 4, Supabase, Tailwind, shadcn-vue, Pinia).
- Explicitly out of scope: online payments, SMS/WhatsApp/email automation, AI features, heavy analytics, accounting, inventory. Future phases listed in the PRD include WhatsApp integration, reminders, QR support, reporting exports and a React Native app.
- Undecided: installable app / service worker for opening with no connection; final production deployment (the hosted Supabase project no longer resolves); multi-currency.

## Brand Commitments

The name is **Amanah** (Arabic: trust, something held in trust), and it carries the promise of stewarding other people's help faithfully. Voice in the existing copy is plain and direct, in the register of aid work ("Know who you helped, with what, and when."). No logo asset or tagline is confirmed as final; the current mark is a placeholder. No binding visual constraints have been stated.

## Evidence on Hand

- `PRD.md` and `tasks.md` in the repo root document scope and progress.
- `supabase/seed.sql` holds a demo organization ("Al-Rahma Charity", `/public/al-rahma`) with admin, collector and viewer accounts. It is fictional and dev-only.
- Landing page transparency figures (1,240 families, $86k, and so on) are placeholder sample stats, not real data.
- Absent, and not to be fabricated: real customers or organizations, testimonials, case studies, press, benchmarks, pricing, real beneficiary data, a production deployment, and a final logo.

## Product Principles

1. **The history is the product.** Every screen should answer "who received what, and when" in seconds; a forgotten or duplicated act of aid is the failure the whole product exists to prevent.
2. **Never lose a field entry, and never lie about it.** Saved-here versus synced states are honest and calm, and connection limits are stated plainly where they apply.
3. **Beneficiary dignity and privacy first.** Records hold sensitive facts (IDs, income, health). Public surfaces show aggregates only, and write actions and personal data are shown according to role.
4. **Trust is earned in the small details.** The product is for people entrusted with other people's help; numbers must be exact, states unambiguous, and nothing hidden from the people accountable for it.
5. **Arabic is native, not translated.** RTL, Arabic plurals and Arabic-first copy are designed in from the start; English is a full peer, not the source language.

## Accessibility & Inclusion

The PRD requires basic accessibility. Users are often non-technical and use low-end phones with unreliable connectivity. Arabic and English with full RTL support are required, and everything must work at phone widths. No formal standard (such as WCAG level) has been set; that decision is open.
