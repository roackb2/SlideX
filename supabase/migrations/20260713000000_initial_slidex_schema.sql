create extension if not exists pgcrypto with schema extensions;

create type public.workspace_role as enum ('owner', 'editor', 'viewer');
create type public.presentation_kind as enum ('presentation', 'template');
create type public.comment_status as enum ('open', 'resolved');
create type public.asset_kind as enum ('image', 'video', 'file');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  storage_quota_bytes bigint not null default 1073741824 check (storage_quota_bytes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.user_workspace_preferences (
  workspace_id uuid not null,
  user_id uuid not null,
  auto_save_enabled boolean not null default true,
  reduced_motion_enabled boolean not null default false,
  onboarding_completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id)
    on delete cascade
);

create table public.presentations (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 240),
  kind public.presentation_kind not null default 'presentation',
  source text not null default '',
  template_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id)
);

create table public.presentation_user_state (
  presentation_id uuid not null references public.presentations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_opened_at timestamptz not null default now(),
  primary key (presentation_id, user_id)
);

create table public.slide_comments (
  id uuid primary key default extensions.gen_random_uuid(),
  presentation_id uuid not null references public.presentations (id) on delete cascade,
  slide_index integer not null check (slide_index >= 0),
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  status public.comment_status not null default 'open',
  version integer not null default 1 check (version > 0),
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'open' and resolved_at is null and resolved_by is null)
    or (status = 'resolved' and resolved_at is not null and resolved_by is not null)
  )
);

create table public.presentation_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  presentation_id uuid not null references public.presentations (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null default 0 check (byte_size >= 0),
  preview_storage_path text unique,
  preview_mime_type text,
  preview_byte_size bigint not null default 0 check (preview_byte_size >= 0),
  kind public.asset_kind not null default 'file',
  created_at timestamptz not null default now(),
  foreign key (presentation_id, workspace_id)
    references public.presentations (id, workspace_id)
    on delete cascade,
  check (
    (preview_storage_path is null and preview_mime_type is null and preview_byte_size = 0)
    or (
      preview_storage_path is not null
      and preview_mime_type is not null
      and preview_byte_size > 0
    )
  )
);

create index workspace_memberships_user_id_idx
  on public.workspace_memberships (user_id, workspace_id);
create index presentations_workspace_updated_at_idx
  on public.presentations (workspace_id, updated_at desc);
create index presentations_owner_id_idx
  on public.presentations (owner_id);
create index presentation_user_state_recent_idx
  on public.presentation_user_state (user_id, last_opened_at desc);
create index slide_comments_presentation_slide_idx
  on public.slide_comments (presentation_id, slide_index, created_at);
create index presentation_assets_presentation_idx
  on public.presentation_assets (presentation_id, created_at);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.can_edit_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and role in ('owner', 'editor')
  );
$$;

create or replace function private.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and owner_id = (select auth.uid())
  );
$$;

create or replace function private.shares_workspace_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships current_member
    join public.workspace_memberships target_member
      on target_member.workspace_id = current_member.workspace_id
    where current_member.user_id = (select auth.uid())
      and target_member.user_id = target_user_id
  );
$$;

create or replace function private.workspace_id_from_storage_path(object_name text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.workspaces
  where id::text = split_part(object_name, '/', 1)
  limit 1;
$$;

create or replace function private.within_workspace_storage_quota(
  target_workspace_id uuid,
  incoming_bytes bigint
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select
        coalesce(sum(coalesce(nullif(objects.metadata ->> 'size', '')::bigint, 0)), 0)
          + greatest(incoming_bytes, 0)
          <= workspaces.storage_quota_bytes
      from public.workspaces
      left join storage.objects
        on objects.bucket_id = 'presentation-assets'
       and objects.name like workspaces.id::text || '/%'
      where workspaces.id = target_workspace_id
      group by workspaces.storage_quota_bytes
    ),
    false
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public;
revoke all on function private.can_edit_workspace(uuid) from public;
revoke all on function private.is_workspace_owner(uuid) from public;
revoke all on function private.shares_workspace_with(uuid) from public;
revoke all on function private.workspace_id_from_storage_path(text) from public;
revoke all on function private.within_workspace_storage_quota(uuid, bigint) from public;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.can_edit_workspace(uuid) to authenticated;
grant execute on function private.is_workspace_owner(uuid) to authenticated;
grant execute on function private.shares_workspace_with(uuid) to authenticated;
grant execute on function private.workspace_id_from_storage_path(text) to authenticated;
grant execute on function private.within_workspace_storage_quota(uuid, bigint) to authenticated;

create or replace function public.workspace_storage_usage(target_workspace_id uuid)
returns table (used_bytes bigint, quota_bytes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(sum(assets.byte_size + assets.preview_byte_size), 0)::bigint as used_bytes,
    workspaces.storage_quota_bytes as quota_bytes
  from public.workspaces
  left join public.presentation_assets as assets
    on assets.workspace_id = workspaces.id
  where workspaces.id = target_workspace_id
    and private.is_workspace_member(target_workspace_id)
  group by workspaces.storage_quota_bytes;
$$;

revoke all on function public.workspace_storage_usage(uuid) from public;
grant execute on function public.workspace_storage_usage(uuid) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function private.set_updated_at();
create trigger user_workspace_preferences_set_updated_at
before update on public.user_workspace_preferences
for each row execute function private.set_updated_at();
create trigger presentations_set_updated_at
before update on public.presentations
for each row execute function private.set_updated_at();
create trigger slide_comments_set_updated_at
before update on public.slide_comments
for each row execute function private.set_updated_at();

create or replace function private.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_memberships (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.user_workspace_preferences (workspace_id, user_id)
  values (new.id, new.owner_id);

  return new;
end;
$$;

create trigger workspaces_create_owner_membership
after insert on public.workspaces
for each row execute function private.handle_new_workspace();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Creator'
  );

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    profile_name,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  insert into public.workspaces (owner_id, name)
  values (new.id, 'Personal workspace');

  return new;
end;
$$;

create trigger auth_users_create_profile_and_workspace
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select
  users.id,
  coalesce(
    nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(users.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    'Creator'
  ),
  coalesce(users.raw_user_meta_data ->> 'avatar_url', users.raw_user_meta_data ->> 'picture')
from auth.users as users
on conflict (id) do nothing;

insert into public.workspaces (owner_id, name)
select profiles.id, 'Personal workspace'
from public.profiles
where not exists (
  select 1 from public.workspaces where owner_id = profiles.id
);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.user_workspace_preferences enable row level security;
alter table public.presentations enable row level security;
alter table public.presentation_user_state enable row level security;
alter table public.slide_comments enable row level security;
alter table public.presentation_assets enable row level security;

create policy "profiles_select_workspace_peers"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or private.shares_workspace_with(id));
create policy "profiles_update_self"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "workspaces_select_members"
on public.workspaces for select to authenticated
using (private.is_workspace_member(id));
create policy "workspaces_insert_owner"
on public.workspaces for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "workspaces_update_owner"
on public.workspaces for update to authenticated
using (private.is_workspace_owner(id))
with check (owner_id = (select auth.uid()));
create policy "workspaces_delete_owner"
on public.workspaces for delete to authenticated
using (private.is_workspace_owner(id));

create policy "workspace_memberships_select_members"
on public.workspace_memberships for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "workspace_memberships_insert_owner"
on public.workspace_memberships for insert to authenticated
with check (private.is_workspace_owner(workspace_id));
create policy "workspace_memberships_update_owner"
on public.workspace_memberships for update to authenticated
using (private.is_workspace_owner(workspace_id))
with check (private.is_workspace_owner(workspace_id));
create policy "workspace_memberships_delete_owner"
on public.workspace_memberships for delete to authenticated
using (private.is_workspace_owner(workspace_id) and user_id <> (select auth.uid()));

create policy "user_workspace_preferences_select_self"
on public.user_workspace_preferences for select to authenticated
using (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id));
create policy "user_workspace_preferences_insert_self"
on public.user_workspace_preferences for insert to authenticated
with check (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id));
create policy "user_workspace_preferences_update_self"
on public.user_workspace_preferences for update to authenticated
using (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id))
with check (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id));

create policy "presentations_select_members"
on public.presentations for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "presentations_insert_editors"
on public.presentations for insert to authenticated
with check (
  private.can_edit_workspace(workspace_id)
  and owner_id = (select auth.uid())
);
create policy "presentations_update_editors"
on public.presentations for update to authenticated
using (private.can_edit_workspace(workspace_id))
with check (private.can_edit_workspace(workspace_id));
create policy "presentations_delete_editors"
on public.presentations for delete to authenticated
using (private.can_edit_workspace(workspace_id) and kind = 'presentation');

create policy "presentation_user_state_select_self"
on public.presentation_user_state for select to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.presentations
    where presentations.id = presentation_user_state.presentation_id
      and private.is_workspace_member(presentations.workspace_id)
  )
);
create policy "presentation_user_state_insert_self"
on public.presentation_user_state for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.presentations
    where presentations.id = presentation_user_state.presentation_id
      and private.is_workspace_member(presentations.workspace_id)
  )
);
create policy "presentation_user_state_update_self"
on public.presentation_user_state for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "slide_comments_select_members"
on public.slide_comments for select to authenticated
using (
  exists (
    select 1 from public.presentations
    where presentations.id = slide_comments.presentation_id
      and private.is_workspace_member(presentations.workspace_id)
  )
);
create policy "slide_comments_insert_members"
on public.slide_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.presentations
    where presentations.id = slide_comments.presentation_id
      and private.is_workspace_member(presentations.workspace_id)
  )
);
create policy "slide_comments_update_author_or_editor"
on public.slide_comments for update to authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1 from public.presentations
    where presentations.id = slide_comments.presentation_id
      and private.can_edit_workspace(presentations.workspace_id)
  )
)
with check (
  author_id = (select auth.uid())
  or exists (
    select 1 from public.presentations
    where presentations.id = slide_comments.presentation_id
      and private.can_edit_workspace(presentations.workspace_id)
  )
);
create policy "slide_comments_delete_author_or_editor"
on public.slide_comments for delete to authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1 from public.presentations
    where presentations.id = slide_comments.presentation_id
      and private.can_edit_workspace(presentations.workspace_id)
  )
);

create policy "presentation_assets_select_members"
on public.presentation_assets for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "presentation_assets_insert_editors"
on public.presentation_assets for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and private.can_edit_workspace(workspace_id)
  and exists (
    select 1 from public.presentations
    where presentations.id = presentation_assets.presentation_id
      and presentations.workspace_id = presentation_assets.workspace_id
  )
);
create policy "presentation_assets_delete_editors"
on public.presentation_assets for delete to authenticated
using (private.can_edit_workspace(workspace_id));

grant usage on type public.workspace_role to authenticated;
grant usage on type public.presentation_kind to authenticated;
grant usage on type public.comment_status to authenticated;
grant usage on type public.asset_kind to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant select, delete on public.workspaces to authenticated;
grant insert (owner_id, name) on public.workspaces to authenticated;
grant update (name) on public.workspaces to authenticated;
grant select, insert, delete on public.workspace_memberships to authenticated;
grant update (role) on public.workspace_memberships to authenticated;
grant select, insert on public.user_workspace_preferences to authenticated;
grant update (auto_save_enabled, reduced_motion_enabled, onboarding_completed_at)
  on public.user_workspace_preferences to authenticated;
grant select, insert, delete on public.presentations to authenticated;
grant update (title, source, template_id) on public.presentations to authenticated;
grant select, insert on public.presentation_user_state to authenticated;
grant update (last_opened_at) on public.presentation_user_state to authenticated;
grant select, insert, delete on public.slide_comments to authenticated;
grant update (body, status, version, resolved_by, resolved_at)
  on public.slide_comments to authenticated;
grant select, insert, delete on public.presentation_assets to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'presentation-assets',
  'presentation-assets',
  false,
  52428800,
  array[
    'application/pdf',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "presentation_assets_storage_select_members"
on storage.objects for select to authenticated
using (
  bucket_id = 'presentation-assets'
  and private.is_workspace_member(private.workspace_id_from_storage_path(name))
);
create policy "presentation_assets_storage_insert_editors"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'presentation-assets'
  and private.can_edit_workspace(private.workspace_id_from_storage_path(name))
  and private.within_workspace_storage_quota(
    private.workspace_id_from_storage_path(name),
    coalesce(nullif(metadata ->> 'size', '')::bigint, 0)
  )
);
create policy "presentation_assets_storage_delete_editors"
on storage.objects for delete to authenticated
using (
  bucket_id = 'presentation-assets'
  and private.can_edit_workspace(private.workspace_id_from_storage_path(name))
);
