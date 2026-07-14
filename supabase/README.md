# SlideX Supabase

Supabase only owns the remote data required by the current product:

- `auth.users`: sign-in identity, managed by Supabase Auth.
- `official_templates`: read-only catalog entries for bundled official templates.
- `presentations`: one user's editable MotionDoc source.
- `agent_sessions`: Heddle conversation metadata owned by one user and presentation.
- `slide_comments`: comments attached to a zero-based slide index, including resolved state.
- `presentation-images`: private Storage bucket for uploaded images.

There are deliberately no profiles, workspaces, memberships, roles, preferences,
AI message mirrors, asset metadata, quota functions, or custom enums. Add those only
when a shipped feature needs them.

The complete MVP schema is intentionally kept in one canonical migration:
`migrations/20260713000000_initial_slidex_schema.sql`.

## Local development

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:types > common/lib/supabase/database.types.ts
npm run supabase:stop
```

`supabase:start` requires a Docker-compatible runtime.

## Hosted deployment

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
npx supabase db push
```

Set the browser-safe project credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never expose a secret or service-role key through a `NEXT_PUBLIC_*` variable.

The app now requires a Next.js server deployment because `proxy.ts`,
`/auth/callback`, and `/api/presentations/import-demo` run on the server. Add
the callback URL below to the Supabase Auth redirect allow list for every
environment:

```text
https://<your-app-origin>/auth/callback
```

Guest Live Demo edits remain in browser storage until OAuth succeeds. The
authenticated import endpoint validates only `importId`, `title`, `source`, and
`templateId`, verifies the template, and inserts through the caller's JWT/RLS.
`guest_import_id` is unique per user, so retries return the original row instead
of creating duplicates. No service-role key is used by this flow.

First-login onboarding completion is stored in the signed-in user's Supabase
Auth metadata through `/api/account/onboarding`. It does not require a profiles
table and is never used for authorization.

## Agent integration

`presentations.source_revision` starts at zero. Browser and Agent document
writes must call `compare_and_swap_presentation_source` with the revision they
last read. A successful write atomically increments the revision; a stale write
fails with PostgreSQL code `40001` and `source_revision_conflict`. Direct
authenticated updates to `title` and `source` are revoked.

`agent_sessions.id` is the Heddle conversation ID. Each row belongs to one user
and one presentation and stores only session metadata: title, message count,
and timestamps. Heddle message content/state is not duplicated into Supabase.
The Agent backend should forward the signed-in user's JWT so CAS and session RLS
run as that user; the browser never receives a service-role key.

## Image paths

The private bucket accepts AVIF, GIF, JPEG, PNG, and WebP images up to 10 MiB.
SVG uploads are intentionally disabled. Every object path must follow:

```text
<user-id>/<presentation-id>/<uuid>.<trusted-extension>
```

The adapter derives the user ID from the authenticated Supabase session and
generates the UUID filename itself; it never puts the original upload name in
the path. Storage RLS verifies the first folder against `auth.uid()` and verifies
that the second folder is a presentation owned by the same user.

`deleteSupabasePresentation` always removes the presentation's Storage objects
through the authenticated `delete-presentation` Edge Function before deleting
its row. The foreign key then cascade-deletes its comments. Deploy it with:

```bash
npx supabase functions deploy delete-presentation
```

The function first verifies the caller and presentation ownership with the
caller's JWT-scoped client. Only after that check does its server-only client use
`SUPABASE_SERVICE_ROLE_KEY` to remove Storage objects and the presentation row.
Authenticated clients have no direct `DELETE` grant on `presentations`, so they
cannot bypass this cleanup order. The service-role key is supplied by the
Supabase Edge Function runtime and is never exposed to browser code.

Storage RLS also requires exactly two folders, a UUID filename, an approved
extension, and a still-existing presentation owned by the caller. This means
orphan cleanup after a presentation row is gone must be a separate trusted
maintenance job; the normal deletion flow intentionally removes images first.

## Official templates

The database stores catalog metadata only. MotionDoc template source remains in
`core/motion-doc/presets/`, avoiding a second copy of large template documents.
The migration registers the built-in `welcome-to-slidex` and `launch-deck`
templates, and the local seed keeps those rows current after resets.
Authenticated and anonymous clients can read active templates; only trusted
server code can change the catalog.
