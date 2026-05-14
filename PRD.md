# Product Requirements Document (PRD)

# Beneficiary & Aid Distribution Management System

Version: 1.0
Status: MVP / Month 1
Author: ChatGPT (reviewed & improved by Antigravity)
Target Audience: Claude Code / Engineering Implementation

---

# 1. Product Overview

## Product Vision

A web-based SaaS platform that helps charities, mosques, community groups, and aid organizations manage beneficiaries, recurring aid needs, donations, and aid distributions in a transparent and operationally efficient way.

The platform focuses primarily on:

- Beneficiary management
- Recurring aid tracking
- Distribution history
- Operational workflows
- Transparency

This is NOT a crowdfunding platform.

This is a:

> Beneficiary and aid-distribution operating system.

---

# 2. Core Problem

Small and medium organizations currently manage beneficiaries using:

- WhatsApp
- Paper records
- Excel sheets
- Google Sheets
- Manual bookkeeping

This creates major operational problems:

- Duplicate aid distributions
- Forgotten recurring cases
- Poor tracking of medical cases
- No centralized beneficiary history
- Lack of operational visibility
- Difficult auditing
- Weak transparency
- Data inconsistency

Organizations need a simple system to:

- Register beneficiaries
- Track recurring aid needs
- Record every aid distribution
- Know who received what and when
- Track financial aid and non-financial aid
- Monitor ongoing cases

---

# 3. Product Goals

## Primary Goals

### Goal 1

Provide a centralized beneficiary database.

### Goal 2

Track recurring aid needs.

### Goal 3

Track aid distributions historically.

### Goal 4

Help organizations avoid duplicate or forgotten support.

### Goal 5

Provide operational transparency.

---

# 4. MVP Scope (Month 1)

## Included Features

### Authentication

- Login
- Signup
- Session persistence
- Password reset

### Organization Management

- Create organization
- Invite members
- Role management

### Beneficiary Management

- Create beneficiary
- Edit beneficiary
- View beneficiary profile
- Search beneficiaries
- Beneficiary notes

### Beneficiary Needs

- Create recurring needs
- Track frequency
- Track estimated cost
- Track active/inactive status
- Track urgency/priority level
- Tag beneficiaries by category (widows, orphans, medical, etc.)

### Aid Distribution Tracking

- Record aid distributions
- View historical distributions
- Attach proofs/images
- Record aid types

### Donations Tracking

- Record incoming donations manually
- Track donation totals

### Dashboard

- Key metrics
- Active beneficiaries
- Recurring cases
- Total distributed aid

### Public Transparency Page

- Anonymous aggregate statistics only

---

## Explicitly Excluded From MVP

### Payments

No online payment integrations.

### Notifications

No SMS, email, or WhatsApp automation.

### AI Features

No AI summaries or recommendations.

### Advanced Analytics

No charts-heavy analytics system.

### Accounting

No accounting module.

### Inventory

No warehouse or inventory management.

### Multi-language

English only for MVP.

---

# 5. User Roles

## 5.1 Organization Admin

### Permissions

Can:

- Manage organization
- Invite members
- Create/edit beneficiaries
- Create/edit needs
- Record distributions
- Record donations
- View dashboard
- Upload files

---

## 5.2 Collector / Staff

### Permissions

Can:

- View assigned beneficiaries
- Record distributions
- Add notes
- Upload proofs

Cannot:

- Delete beneficiaries
- Manage organization settings
- Invite users

---

## 5.3 Viewer

Read-only access.

Can:

- View beneficiaries
- View distributions
- View dashboard

Cannot:

- Edit anything

---

## 5.4 Public Visitor

Can only:

- View public transparency page

Cannot:

- View beneficiary identities
- View sensitive data

---

# 6. Core User Flows

# 6.1 Organization Setup Flow

```text
Landing Page
    ↓
Signup
    ↓
Create Organization
    ↓
Dashboard
```

---

# 6.2 Beneficiary Registration Flow

```text
Dashboard
    ↓
Beneficiaries
    ↓
Add Beneficiary
    ↓
Fill Personal Information
    ↓
Save Beneficiary
    ↓
Beneficiary Profile Page
```

---

# 6.3 Add Recurring Need Flow

```text
Beneficiary Profile
    ↓
Add Need
    ↓
Select Need Type
    ↓
Select Frequency
    ↓
Save Need
```

---

# 6.4 Aid Distribution Flow

```text
Beneficiary Profile
    ↓
Add Distribution
    ↓
Enter Aid Details
    ↓
Upload Proof (Optional)
    ↓
Save Distribution
```

---

# 6.5 Donation Recording Flow

```text
Dashboard
    ↓
Donations
    ↓
Add Donation
    ↓
Save Donation
```

---

# 7. Functional Requirements

# 7.1 Authentication

## Requirements

### User Signup

Users must be able to:

- register using email/password
- receive secure authentication

### User Login

Users must be able to:

- login securely
- stay authenticated across sessions

### Password Reset

Users must be able to reset passwords.

---

# 7.2 Organization Management

## Create Organization

### Fields

- organization_name
- slug

### Validation

- slug must be unique
- organization name required

---

## Invite Members

### Admin can:

- invite users by email
- assign role

---

# 7.3 Beneficiary Management

## Create Beneficiary

### Required Fields

- full_name
- phone
- city

### Optional Fields

- national_id
- address
- family_size
- monthly_income
- employment_status
- health_conditions
- notes
- birth_date
- gender

---

## Beneficiary Status

Possible values:

- active
- inactive
- archived

---

## Search Beneficiaries

Must support:

- name search
- phone search
- national ID search

Search must be fast.

---

## Beneficiary Profile Page

Must display:

- personal information
- active needs
- distribution history
- uploaded files
- notes
- recent activity

---

# 7.4 Beneficiary Needs

## Need Types

Initial predefined values:

- food
- medicine
- rent
- surgery
- education
- utilities
- other

---

## Frequency Types

Allowed values:

- one_time
- weekly
- monthly
- yearly

---

## Need Fields

### Required

- type
- frequency

### Optional

- description
- estimated_cost
- start_date
- end_date
- urgency (low / medium / high / critical)

---

## Need Status

Allowed values:

- active
- completed
- paused

---

## Urgency Levels

Allowed values:

- low
- medium
- high
- critical

---

# 7.5 Aid Distribution Tracking

## Create Distribution

### Required Fields

- beneficiary
- type
- distribution_date

### Optional Fields

- amount
- notes
- proof_attachment
- related_need

---

## Distribution Types

Allowed values:

- cash
- food_package
- medicine
- rent_payment
- utilities
- surgery_support
- education_support
- other

---

## Distribution Timeline

Each beneficiary profile must show a chronological history of all distributions.

Example:

```text
Jan 2026
- Food package delivered
- Medicine support

Feb 2026
- Rent support
```

---

# 7.6 Donation Tracking

## Add Donation

### Required Fields

- donor_name (or "Anonymous" if is_anonymous)
- amount
- date

### Optional Fields

- payment_method
- notes
- is_anonymous
- currency (default: USD)

---

## Payment Methods

Allowed values:

- cash
- bank_transfer
- wallet
- other

---

# 7.7 Dashboard

## Dashboard Metrics

### Beneficiary Metrics

- total beneficiaries
- active beneficiaries
- recurring cases
- urgent cases

### Financial Metrics

- total donations
- total distributed
- remaining balance

### Operational Metrics

- distributions this month
- upcoming recurring needs

---

# 7.8 Public Transparency Page

## Public Data Rules

Public pages MUST NOT expose:

- beneficiary names
- personal information
- phone numbers
- addresses
- documents

---

## Public Page Should Display

### Aggregate Metrics

- total families supported
- total aid distributed
- total medical cases
- total food distributions

---

# 8. Non-Functional Requirements

# 8.1 Performance

## Requirements

- Page load under 3 seconds
- Beneficiary search under 500ms
- Mobile-first optimization

---

# 8.2 Security

## Requirements

- Role-based access control
- Secure authentication
- HTTPS only
- Row-level permissions
- Sensitive data protection

---

# 8.3 Scalability

Initial architecture should support:

- 10,000 beneficiaries
- 100,000 distributions

Without major redesign.

---

# 8.4 Reliability

- Soft deletes preferred
- Audit logs required for important actions

---

# 9. Technical Architecture

## Arc

- Monorepo (Turborepo) — required for future React Native app

```text
amanah/
├── apps/
│   └── web/          ← Nuxt 4 app
├── packages/
│   └── types/        ← Shared TypeScript types (web + RN)
├── supabase/
│   ├── migrations/   ← SQL migration files
│   └── seed/         ← Dev seed data
├── package.json
└── turbo.json
```

# 9.1 Frontend

## Stack

- Nuxt 4
- TypeScript
- Pinia
- TanStack Query
- Tailwind CSS
- shadcn-vue
- vee-validate
- zod

---

# 9.2 Backend

## Recommended

Use:

- Supabase

For:

- Authentication
- PostgreSQL database
- Storage
- Row Level Security

---

# 9.3 Storage

Use Supabase Storage for:

- beneficiary documents
- prescriptions
- receipts
- proof images

---

# 9.4 Hosting

## Frontend Hosting

Recommended:

- Vercel

## Backend

- Supabase

---

# 10. Database Design

> **Note:** Do NOT create a separate `users` table — use Supabase `auth.users` directly.
> Extend it with a `profiles` table below to avoid data drift.

# 10.1 profiles

```sql
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
)
```

---

# 10.2 organizations

```sql
organizations (
  id uuid primary key,
  name text,
  slug text unique,
  owner_id uuid,
  created_at timestamp
)
```

---

# 10.3 organization_members

```sql
organization_members (
  id uuid primary key,
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'collector', 'viewer')),
  status text default 'active' check (status in ('pending', 'active')),
  invited_by uuid references auth.users(id),
  created_at timestamp default now()
)
```

---

# 10.4 beneficiaries

```sql
beneficiaries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  national_id text,
  gender text check (gender in ('male', 'female', 'other')),
  birth_date date,
  address text,
  city text not null,
  family_size integer,
  employment_status text,
  monthly_income numeric,
  health_conditions text,
  category text,                    -- widows, orphans, medical, etc.
  status text default 'active' check (status in ('active', 'inactive', 'archived')),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp              -- soft delete
)

-- Full-text search index (pg_trgm must be enabled)
create extension if not exists pg_trgm;
create index idx_beneficiaries_name_trgm on beneficiaries using gin(full_name gin_trgm_ops);
create index idx_beneficiaries_phone_trgm on beneficiaries using gin(phone gin_trgm_ops);
create index idx_beneficiaries_national_id on beneficiaries(national_id);
```

---

# 10.5 beneficiary_needs

```sql
beneficiary_needs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  beneficiary_id uuid references beneficiaries(id) on delete cascade,
  type text not null,
  description text,
  estimated_cost numeric,
  frequency text not null check (frequency in ('one_time', 'weekly', 'monthly', 'yearly')),
  urgency text default 'medium' check (urgency in ('low', 'medium', 'high', 'critical')),
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  start_date date,
  end_date date,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp              -- soft delete
)
```

---

# 10.6 aid_distributions

```sql
aid_distributions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  beneficiary_id uuid references beneficiaries(id) on delete cascade,
  need_id uuid references beneficiary_needs(id) on delete set null,
  type text not null,
  amount numeric,
  notes text,
  proof_attachment_url text,
  distributed_by uuid references auth.users(id),
  distribution_date date not null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp              -- soft delete
)
```

---

# 10.7 donations

```sql
donations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  donor_name text,
  is_anonymous boolean default false,
  amount numeric not null,
  currency text default 'USD',
  payment_method text check (payment_method in ('cash', 'bank_transfer', 'wallet', 'other')),
  notes text,
  donated_at timestamp not null,
  created_by uuid references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp              -- soft delete
)
```

---

# 10.8 audit_logs

```sql
audit_logs (
  id uuid primary key,
  user_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamp
)
```

---

# 11. Row Level Security Rules

# Organization Isolation

Users MUST only access data belonging to organizations they are members of.

---

# Admin Permissions

Admins can:

- CRUD beneficiaries
- CRUD needs
- CRUD distributions
- CRUD donations
- invite members

---

# Collector Permissions

Collectors can:

- view beneficiaries
- create distributions
- upload proofs

Collectors cannot:

- delete beneficiaries
- manage organization settings

---

# 12. Frontend Application Structure

> **Note:** Nuxt 3 uses file-system routing — no `router/` directory needed.
> Use `services/` only (not `api/`) to avoid duplication.

```text
apps/web/
├── assets/
├── components/
│   ├── ui/            ← shadcn-vue base components
│   ├── beneficiary/
│   ├── distribution/
│   └── shared/
├── composables/
├── layouts/
├── pages/             ← File-system routing (Nuxt 3)
├── services/          ← Supabase query wrappers
├── stores/            ← Pinia stores
├── types/             ← Local types (extend packages/types)
├── utils/
└── app.vue
```

---

# 13. Frontend Routes

```text
/                          ← Landing page
/login                     ← Login
/signup                    ← Signup
/onboarding                ← Create organization (post-signup)
/invite/accept             ← Accept org invite
/dashboard                 ← Main dashboard
/beneficiaries             ← Beneficiary list
/beneficiaries/new         ← Add beneficiary (full-page fallback)
/beneficiaries/:id         ← Beneficiary profile (tabbed)
/donations                 ← Donations list
/settings                  ← Org settings
/settings/members          ← Member management
/public/:organizationSlug  ← Public transparency page
```

---

# 14. Required MVP Pages

# 14.1 Landing Page

## Sections

- Hero
- Features
- Transparency section
- CTA

---

# 14.2 Login Page

Fields:

- email
- password

---

# 14.3 Dashboard

Widgets:

- Total beneficiaries
- Active recurring cases
- Total donations
- Total distributions
- Recent activity

---

# 14.4 Beneficiary List Page

## Features

- Search
- Filter by status
- Table view

### Columns

- name
- city
- family size
- last support date
- active needs
- status

---

# 14.5 Beneficiary Profile Page

> Use a **tab layout** for mobile usability. Each section is a tab.

## Tabs

### Tab 1: Personal Information

- full name
- phone
- address
- income
- family size
- category/tag
- employment status
- health conditions

### Tab 2: Active Needs

- recurring support needs with urgency badges
- quick "Mark as Distributed" action per need

### Tab 3: Distribution History

- chronological timeline of all distributions
- grouped by month

### Tab 4: Attachments

- uploaded documents, prescriptions, receipts

### Tab 5: Notes

- operational notes with timestamps

---

# 14.6 Add Beneficiary Modal

Fields:

- full name
- phone
- city
- address
- notes
- family size
- monthly income

---

# 14.7 Add Distribution Modal

Fields:

- distribution type
- amount
- date
- notes
- upload proof

---

# 14.8 Donations Page

## Features

- donations table
- add donation button
- totals summary

---

# 14.9 Settings Page

## Features

- organization settings
- member management

---

# 15. File Upload Requirements

Allowed uploads:

- images
- PDFs

Maximum size:

- 10MB

Allowed use cases:

- prescriptions
- receipts
- beneficiary documents
- proof of distribution

---

# 16. Audit Logging

The system MUST log:

- beneficiary creation
- beneficiary edits
- distributions
- donation creation
- member invitations

---

# 17. UX Requirements

# Mobile First

The application MUST be optimized primarily for mobile devices.

Important because:

- field workers use phones
- volunteers operate on mobile

---

# Fast Data Entry

Data entry flows must minimize clicks.

---

# Accessibility

Basic accessibility support required.

---

# 18. Future Features (NOT FOR MVP)

These should NOT be implemented yet.

## Phase 2

- WhatsApp integration
- reminders
- recurring alerts
- Arabic language
- QR support

## Phase 3

- payment integrations
- AI recommendations
- analytics
- reporting exports

## Phase 4

- inventory management
- logistics
- route planning
- government integrations

---

# 19. Success Metrics

MVP success criteria:

## Operational Success

- organizations stop using spreadsheets
- beneficiaries tracked centrally
- recurring needs tracked successfully

## Usage Success

- at least 3 active organizations
- weekly active staff usage

## Product Success

- organizations trust the system
- support history becomes operationally useful

---

# 20. Engineering Priorities

# Priority 1

Beneficiary profile system.

# Priority 2

Distribution tracking.

# Priority 3

Fast search and usability.

# Priority 4

Mobile UX.

---

# 21. Recommended Development Order

## Week 1

- auth
- organizations
- beneficiary CRUD

## Week 2

- beneficiary profile
- needs system
- distributions

## Week 3

- donations
- dashboard
- public transparency page

## Week 4

- permissions
- audit logs
- mobile polish
- bug fixing
- deployment

---

# 22. Important Implementation Notes For Claude Code

## Architecture Philosophy

Keep implementation SIMPLE.

Do NOT:

- over-engineer
- create microservices
- introduce unnecessary abstractions
- add premature optimizations

---

## Recommended Approach

Use:

- direct Supabase queries
- composables
- simple service layer
- modular Vue components

---

## Important UX Principle

The application is primarily:

- an operational tool
- used daily
- by non-technical users

Therefore:

- clarity is more important than visual complexity
- speed is more important than fancy animations
- mobile usability is critical

---

# END OF PRD
