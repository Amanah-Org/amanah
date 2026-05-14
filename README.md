# Amanah — Beneficiary & Aid Distribution Management

Amanah is a web-based SaaS platform built to help charities, mosques, community groups, and aid organizations manage beneficiaries, track recurring aid needs, and record distributions transparently.

## Tech Stack
- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue.js)
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
You need to apply the initial schema migration to your Supabase instance.
You can either run this in your local Supabase instance or against a remote Supabase project.

If using the Supabase CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

Alternatively, copy the contents of `supabase/migrations/001_initial_schema.sql` and run it in the SQL Editor of your Supabase dashboard.

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
- `apps/web`: The main Nuxt 3 web application.
- `packages/types`: Shared TypeScript definitions used across the monorepo.
- `supabase/migrations`: SQL migration files defining the database schema and Row Level Security (RLS) policies.
