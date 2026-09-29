# Deployment

Merging into `dev` runs `.github/workflows/deploy-dev.yml`:

1. **check**: lint and build (`ci.yml`)
2. **migrate**: `supabase db push` against the dev Supabase project
3. **deploy**: call a Vercel Deploy Hook, which builds `apps/web` from the `dev` branch

Pull requests and pushes to `main` run only the check.

## One-time setup

### Supabase (dev project)
1. Create a project. Note the **project ref** and **database password**.
2. Auth → URL Configuration: set the Site URL to the dev URL and add redirect URLs
   `<url>/confirm`, `<url>/invite/accept`, `<url>/reset-password`.
3. Create an access token at supabase.com/dashboard/account/tokens.

### Vercel (dev project)
1. Import the repo. Root Directory: `apps/web`, and enable "Include source files outside of the Root Directory".
2. Set these Production environment variables: `SUPABASE_URL`, `SUPABASE_KEY` (anon key), `SUPABASE_SERVICE_ROLE_KEY`.
3. Settings → Git: set the **Production Branch** to `dev`, and create a **Deploy Hook** named `github-dev` on branch `dev`. Copy its URL.
4. Turn off Vercel's own auto-deploy on push (Ignored Build Step: `exit 0`) so only the hook triggers builds, after migrations.

### GitHub
Settings → Environments → create `dev`, then add these secrets to it:

| Secret | Value |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabase access token |
| `SUPABASE_PROJECT_REF` | dev project ref |
| `SUPABASE_DB_PASSWORD` | dev database password |
| `VERCEL_DEPLOY_HOOK_URL` | the Deploy Hook URL from Vercel (treat as a secret) |

Create the `dev` branch from `main` and protect it (require a PR and passing CI).

## Production
Not automated yet. Repeat the setup with a `production` environment and a workflow triggered from `main` (or a manual `workflow_dispatch`).

## Smoke test after a deploy
Sign up, create an organization, invite a member, add a beneficiary, add a need, record a distribution, add a donation, open `/public/<slug>`.
