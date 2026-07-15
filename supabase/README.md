# SlideX Supabase

Supabase only owns the remote data required by the current product:

- `auth.users`: sign-in identity, managed by Supabase Auth.
- `official_templates`: read-only catalog entries for bundled official templates.
- `presentations`: one user's editable MotionDoc source, including protected
  starter rows identified by `kind = 'template'`.
- `agent_sessions`: Heddle conversation metadata owned by one user and presentation.
- `slide_comments`: comments attached to a zero-based slide index, including resolved state.
- `presentation-images`: private Storage bucket for uploaded images.

There are deliberately no profiles, workspaces, memberships, roles, preferences,
AI message mirrors, asset metadata, quota functions, or custom enums. Add those only
when a shipped feature needs them.

The MVP baseline lives in
`migrations/20260713000000_initial_slidex_schema.sql`. Later additive migrations
preserve deployed projects while tightening a specific contract; they must be
applied in timestamp order. Template cleanup migrations preserve only the
official templates currently shipped in the workspace.

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
The Heddle-backed server catalog remains the read authority. The authenticated
browser verifies its Presentation relationships through RLS and calls
`sync_agent_session_catalog` to repair the product index in one atomic batch.
That RPC rejects ownership/identity conflicts and ignores stale writes that
would reduce a session's message count. Direct authenticated inserts and updates
are revoked; deletion stays RLS-scoped so a removed Heddle session can clean up
its metadata by canonical session ID. If projection repair fails, SlideX keeps
the canonical conversation list usable and shows a retryable warning.

Apply `20260715140000_sync_agent_session_catalog.sql` before deploying the
reconciled editor. Until that migration is present, conversations still load
from Heddle, but the UI reports that its Supabase index could not be updated.
The Agent backend should forward the signed-in user's JWT so document CAS and
session ownership use the same product identity; the browser never receives a
service-role key.

## Image paths

The private bucket accepts AVIF, GIF, JPEG, PNG, and WebP images up to 10 MiB.
SVG uploads are intentionally disabled. Every object path must follow:

```text
<user-id>/<presentation-id>/<uuid>.<trusted-extension>
```

The browser sends prepared images to the authenticated Next route at
`POST /api/presentation-images` and removes them through `DELETE` on the same
route. Both operations verify the session and presentation ownership before the
caller-scoped Supabase client changes Storage. The upload adapter derives the
user ID from that authenticated session and generates the UUID filename itself;
it never puts the original upload name in the path. Storage RLS then verifies the
first folder against `auth.uid()` and verifies that the second folder is a
presentation owned by the same user.

`deleteSupabasePresentation` always removes the presentation's Storage objects
through the authenticated `delete-presentation` Edge Function before deleting
its row. The foreign key then cascade-deletes its comments. Deploy it with:

```bash
npx supabase functions deploy delete-presentation
```

The function first verifies the caller and presentation ownership with the
caller's JWT-scoped client. Only after that check does its server-only client use
`SUPABASE_SERVICE_ROLE_KEY` to remove Storage objects and the presentation row.
Rows with `kind = 'template'` are rejected before any Storage or database
deletion, so official workspace starters cannot be removed through the client.
Authenticated clients have no direct `DELETE` grant on `presentations`, so they
cannot bypass this cleanup order. The service-role key is supplied by the
Supabase Edge Function runtime and is never exposed to browser code.

The workspace removes a confirmed presentation from local state immediately,
then runs the Storage-first Edge Function cleanup in the background. If the
request fails, it reloads the RLS-filtered presentation list and shows an error.
An RLS-authorized private Realtime Broadcast topic is scoped to
`workspace-presentations:<user-id>`. A database trigger emits presentation
changes only to that owner's topic, and the workspace listens for `DELETE` to
reload other open tabs after the row is removed. Realtime synchronizes clients,
while the optimistic state update is what prevents Storage cleanup from
blocking the UI.

Storage RLS also requires exactly two folders, a UUID filename, an approved
extension, and a still-existing presentation owned by the caller. This means
orphan cleanup after a presentation row is gone must be a separate trusted
maintenance job; the normal deletion flow intentionally removes images first.

## Official templates

The database stores catalog metadata only. MotionDoc template source remains in
`core/motion-doc/presets/`, avoiding a second copy of large template documents.
The hosted catalog intentionally keeps only `welcome-to-slidex` and
`launch-deck`. Other bundled MotionDoc presets remain available inside Pitch,
but they are not seeded as workspace presentations. The browser validates
`template_id` against this catalog before writing it to a presentation, so
stale application IDs do not violate the foreign key.
Authenticated and anonymous clients can read active templates; only trusted
server code can change the catalog.

When an authenticated Workspace loads, the browser checks for the two
`kind = 'template'` starter rows and inserts either missing row with the bundled
MotionDoc source. A partial unique index on `(user_id, template_id)` makes this
idempotent across reloads and concurrent tabs. These starter rows appear under
`Your presentations`; choosing a catalog card separately creates a normal,
deletable `kind = 'presentation'` copy.
