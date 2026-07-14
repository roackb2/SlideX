create extension if not exists pgcrypto with schema extensions;

-- Official templates are maintained by the application/service role. Their
-- MotionDoc source remains bundled with the app, so the database only stores
-- the catalog metadata needed to list and identify them.
create table public.official_templates (
  id text primary key,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text not null default '',
  thumbnail_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.presentations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  source text not null default '',
  source_revision bigint not null default 0,
  template_id text references public.official_templates (id) on delete set null,
  guest_import_id uuid,
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint presentations_guest_import_id_unique unique (user_id, guest_import_id),
  constraint presentations_source_revision_check check (source_revision >= 0),
  constraint presentations_source_size_check
    check (octet_length(source) <= 2097152)
);

insert into public.official_templates (
  id,
  name,
  description,
  thumbnail_url,
  sort_order
)
values
  (
    'welcome-to-slidex',
    'Welcome to SlideX',
    'A guided introduction to building presentations in SlideX.',
    '/images/workspace-welcome/welcome-to-slidex.svg',
    10
  ),
  (
    'launch-deck',
    'Launch Deck',
    'A polished product launch narrative for modern teams.',
    '/images/workspace-welcome/launch-deck.svg',
    20
  );

create table public.slide_comments (
  id uuid primary key default extensions.gen_random_uuid(),
  presentation_id uuid not null references public.presentations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slide_index integer not null check (slide_index >= 0),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A presentation can have multiple Heddle conversations. The Heddle
-- conversation ID is used directly as the primary key.
create table public.agent_sessions (
  id text primary key check (char_length(trim(id)) between 1 and 200),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  presentation_id uuid not null
    references public.presentations (id) on delete cascade,
  title text not null default 'New session'
    check (char_length(trim(title)) between 1 and 240),
  message_count integer not null default 0 check (message_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index presentations_user_last_opened_at_idx
  on public.presentations (user_id, last_opened_at desc);

create index slide_comments_presentation_slide_idx
  on public.slide_comments (presentation_id, slide_index, created_at);

create index agent_sessions_user_updated_at_idx
  on public.agent_sessions (user_id, updated_at desc);

create index agent_sessions_presentation_updated_at_idx
  on public.agent_sessions (presentation_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger presentations_set_updated_at
before update of title, source, template_id on public.presentations
for each row execute function public.set_updated_at();

create trigger slide_comments_set_updated_at
before update on public.slide_comments
for each row execute function public.set_updated_at();

create trigger agent_sessions_set_updated_at
before update on public.agent_sessions
for each row execute function public.set_updated_at();

-- Opening a presentation updates recency without making the document look
-- edited. Direct column access is intentionally not granted to clients.
create or replace function public.touch_presentation_opened(target_presentation_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  opened_at timestamptz;
begin
  if auth.uid() is null then
    raise exception using
      errcode = '42501',
      message = 'authentication_required';
  end if;

  update public.presentations
  set last_opened_at = now()
  where id = target_presentation_id
    and user_id = auth.uid()
  returning last_opened_at into opened_at;

  return opened_at;
end;
$$;

-- All document source writes use optimistic concurrency control. A stale
-- editor or Agent write fails atomically instead of overwriting newer source.
create or replace function public.compare_and_swap_presentation_source(
  target_presentation_id uuid,
  expected_source_revision bigint,
  next_source text,
  next_title text default null
)
returns table (
  presentation_id uuid,
  source_revision bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using
      errcode = '42501',
      message = 'authentication_required';
  end if;

  return query
  update public.presentations as presentation
  set source = next_source,
      title = coalesce(next_title, presentation.title),
      source_revision = presentation.source_revision + 1
  where presentation.id = target_presentation_id
    and presentation.user_id = auth.uid()
    and presentation.source_revision = expected_source_revision
  returning
    presentation.id,
    presentation.source_revision,
    presentation.updated_at;

  if found then
    return;
  end if;

  perform 1
  from public.presentations as presentation
  where presentation.id = target_presentation_id
    and presentation.user_id = auth.uid();

  if found then
    raise exception using
      errcode = '40001',
      message = 'source_revision_conflict';
  end if;

  raise exception using
    errcode = '42501',
    message = 'presentation_not_accessible';
end;
$$;

alter table public.official_templates enable row level security;
alter table public.presentations enable row level security;
alter table public.slide_comments enable row level security;
alter table public.agent_sessions enable row level security;

-- Templates are public catalog data, but only trusted server code can mutate
-- them because no insert/update/delete grants or policies are provided.
create policy "official_templates_read_active"
on public.official_templates for select
to anon, authenticated
using (is_active);

create policy "presentations_read_own"
on public.presentations for select
to authenticated
using (user_id = (select auth.uid()));

create policy "presentations_create_own"
on public.presentations for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "presentations_update_own"
on public.presentations for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "slide_comments_read_own_presentation"
on public.slide_comments for select
to authenticated
using (
  exists (
    select 1
    from public.presentations
    where presentations.id = slide_comments.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "slide_comments_create_own_presentation"
on public.slide_comments for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = slide_comments.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "slide_comments_update_own_presentation"
on public.slide_comments for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = slide_comments.presentation_id
      and presentations.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = slide_comments.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "slide_comments_delete_own_presentation"
on public.slide_comments for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = slide_comments.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "agent_sessions_read_own"
on public.agent_sessions for select
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = agent_sessions.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "agent_sessions_create_own"
on public.agent_sessions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = agent_sessions.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "agent_sessions_update_own"
on public.agent_sessions for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = agent_sessions.presentation_id
      and presentations.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = agent_sessions.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

create policy "agent_sessions_delete_own"
on public.agent_sessions for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.presentations
    where presentations.id = agent_sessions.presentation_id
      and presentations.user_id = (select auth.uid())
  )
);

-- Establish an explicit least-privilege baseline even on projects that still
-- auto-expose newly created public tables.
revoke all on public.official_templates from anon, authenticated;
revoke all on public.presentations from anon, authenticated;
revoke all on public.slide_comments from anon, authenticated;
revoke all on public.agent_sessions from anon, authenticated;

grant select on public.official_templates to anon, authenticated;
grant select on public.presentations to authenticated;
grant insert (title, source, template_id, guest_import_id) on public.presentations to authenticated;
grant update (template_id) on public.presentations to authenticated;
grant select, delete on public.slide_comments to authenticated;
grant insert (presentation_id, slide_index, body) on public.slide_comments to authenticated;
grant update (body, is_resolved) on public.slide_comments to authenticated;
grant select, delete on public.agent_sessions to authenticated;
grant insert (id, presentation_id, title) on public.agent_sessions to authenticated;
grant update (title, message_count) on public.agent_sessions to authenticated;
grant all on public.official_templates to service_role;
grant all on public.presentations to service_role;
grant all on public.slide_comments to service_role;
grant all on public.agent_sessions to service_role;

revoke all on function public.touch_presentation_opened(uuid) from public;
grant execute on function public.touch_presentation_opened(uuid) to authenticated, service_role;
revoke all on function public.compare_and_swap_presentation_source(uuid, bigint, text, text) from public;
grant execute on function public.compare_and_swap_presentation_source(uuid, bigint, text, text) to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'presentation-images',
  'presentation-images',
  false,
  10485760,
  array[
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Object path: <user-id>/<presentation-id>/<uuid>.<trusted-extension>
create policy "presentation_images_read_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'presentation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](avif|gif|jpg|png|webp)$'
  and exists (
    select 1
    from public.presentations
    where presentations.id::text = (storage.foldername(name))[2]
      and presentations.user_id = (select auth.uid())
  )
);

create policy "presentation_images_upload_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'presentation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](avif|gif|jpg|png|webp)$'
  and exists (
    select 1
    from public.presentations
    where presentations.id::text = (storage.foldername(name))[2]
      and presentations.user_id = (select auth.uid())
  )
);

create policy "presentation_images_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'presentation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](avif|gif|jpg|png|webp)$'
  and exists (
    select 1
    from public.presentations
    where presentations.id::text = (storage.foldername(name))[2]
      and presentations.user_id = (select auth.uid())
  )
);
