# Amanah — Beneficiary & Aid Distribution Management

Amanah is a web-based SaaS platform built to help charities, mosques, community groups, and aid organizations manage beneficiaries, track recurring aid needs, and record distributions transparently.

## Tech Stack
- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue.js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
- **Monorepo**: [Turborepo](https://turbo.build/)

## Prerequisites
- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [npm](https://www.npmjs.com/) (used as the package manager for this monorepo)
- A [Supabase](https://supabase.com/) account (or local CLI) for the database.

## Project Setup

### 1. Install Dependencies
Run the following command at the root of the project to install all dependencies across the workspaces:
```bash
npm install
```

### 2. Configure Environment Variables
Navigate to the `apps/web` directory and copy the example environment file:
```bash
cd apps/web
cp .env.example .env
```
Open `apps/web/.env` and update the values with your actual Supabase project credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### 3. Database Setup (Supabase)

#### Option A — Local Supabase (recommended for development)
Requires Docker. From the repo root:
```bash
npx supabase start      # starts Postgres, Auth, REST, Storage and Mailpit; applies all migrations + seed
npx supabase status -o env   # shows the local API URL, anon key and service role key
```
Put the local values in `apps/web/.env.local` (`SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and run `npm run dev:local` from `apps/web`.

`supabase/seed.sql` creates a demo organization (`/public/al-rahma`) with an admin, a collector and a viewer account; the credentials are documented at the top of that file. Emails (invites, password resets) are caught by Mailpit at http://127.0.0.1:54324.

Reset the database (re-applies every migration and the seed) with `npx supabase db reset`. After schema changes, regenerate the client types:
```bash
npx supabase gen types typescript --local --schema public > apps/web/app/types/database.types.ts
```

#### Option B — Hosted Supabase project
```bash
supabase link --project-ref your-project-ref
supabase db push
```
In the Supabase dashboard, set the Auth Site URL to your app URL and add `<app-url>/confirm`, `<app-url>/invite/accept` and `<app-url>/reset-password` to the redirect URLs.

## Running the Application

### Development Mode
You can start the development server from the root of the project using Turborepo:
```bash
npm run dev
```
Or directly from the web app directory:
```bash
cd apps/web
npm run dev
```
The application will be available at `http://localhost:3000`.

### Production Build
To build the application for production, run:
```bash
npm run build
```
You can then start the production server (depending on your hosting environment, Nuxt creates an `.output` directory).

## Project Structure
- `apps/web`: The main Nuxt 4 web application.
- `packages/types`: Shared TypeScript definitions used across the monorepo.
- `supabase/migrations`: SQL migration files defining the database schema and Row Level Security (RLS) policies.
