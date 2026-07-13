# SlideX Supabase foundation

This directory owns the hosted data structure that will replace the current
demo auth and browser-only persistence incrementally.

## Local commands

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:types > common/lib/supabase/database.types.ts
npm run supabase:stop
```

`supabase:start` requires Docker Desktop, OrbStack, Rancher Desktop, or another
Docker-compatible container runtime.

For a hosted project, copy the URL and publishable key into `.env.local`, then
link and apply the checked-in migration:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
npx supabase db push
```

## Data ownership

- `auth.users`: identity and private email data managed by Supabase Auth.
- `profiles`: public-in-workspace name and avatar data.
- `workspaces` + `workspace_memberships`: multi-user ownership and roles.
- `user_workspace_preferences`: onboarding and the current workspace settings.
- `presentations`: title, template metadata, and the editable MotionDoc MDX source.
- `presentation_user_state`: per-user recency without mutating shared documents.
- `slide_comments`: the existing page-indexed review comments.
- `presentation_assets`: metadata for files in the private `presentation-assets`
  Storage bucket.

## Asset cost controls

- Each workspace starts with a 1 GiB application quota. Only trusted server
  code may raise `storage_quota_bytes`.
- The bucket accepts supported images, MP4/MOV/WebM video, and PDF files only,
  with a hard 50 MiB object limit.
- PNG/JPEG images larger than 1 MiB receive a client-generated WebP preview
  only when that preview saves at least 10%. The original file remains stored
  for PPTX, PNG/PDF, HTML, and MDX export fidelity.
- Immutable UUID-based paths use a one-year browser/CDN cache lifetime.
- Presentation deletion must call
  `deleteSupabasePresentationAssetsForPresentation` before deleting its row;
  `removeOrphanedSupabasePresentationAssetObjects` removes failed-upload
  leftovers through the Storage API.

Every application table has Row Level Security enabled. Browser clients use the
publishable key; authorization comes from the authenticated user JWT and these
policies. Never place a Supabase secret/service-role key in a `NEXT_PUBLIC_*`
variable.

Storage object paths must start with the workspace UUID:

```text
<workspace-id>/<presentation-id>/<unique-file-name>
```
