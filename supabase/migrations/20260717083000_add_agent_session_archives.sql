-- Persist Heddle's completed compaction archives in the same trusted Supabase
-- scope as the session record. The browser never reads or writes these rows.

create table public.agent_session_archives (
  session_id text not null,
  user_id uuid not null,
  archive_id text not null
    check (char_length(trim(archive_id)) between 1 and 200),
  archive_record jsonb not null
    check (jsonb_typeof(archive_record) = 'object'),
  messages jsonb not null
    check (jsonb_typeof(messages) = 'array'),
  summary text not null
    check (char_length(trim(summary)) >= 1),
  created_at timestamptz not null,

  constraint agent_session_archives_pk
    primary key (session_id, user_id, archive_id),

  constraint agent_session_archives_parent_fk
    foreign key (session_id, user_id)
    references public.agent_sessions (id, user_id)
    on delete cascade,

  constraint agent_session_archives_record_check
    check (
      archive_record ? 'id'
      and jsonb_typeof(archive_record -> 'id') = 'string'
      and archive_record ->> 'id' = archive_id
      and archive_record ? 'path'
      and jsonb_typeof(archive_record -> 'path') = 'string'
      and char_length(archive_record ->> 'path') >= 1
      and archive_record ? 'summaryPath'
      and jsonb_typeof(archive_record -> 'summaryPath') = 'string'
      and char_length(archive_record ->> 'summaryPath') >= 1
      and archive_record ? 'messageCount'
      and jsonb_typeof(archive_record -> 'messageCount') = 'number'
      and (archive_record ->> 'messageCount')::numeric >= 0
      and archive_record ? 'createdAt'
      and jsonb_typeof(archive_record -> 'createdAt') = 'string'
      and char_length(archive_record ->> 'createdAt') >= 1
      and (
        not (archive_record ? 'shortDescription')
        or jsonb_typeof(archive_record -> 'shortDescription') = 'string'
      )
      and (
        not (archive_record ? 'summaryModel')
        or jsonb_typeof(archive_record -> 'summaryModel') = 'string'
      )
    )
);

create table public.agent_session_archive_heads (
  session_id text not null,
  user_id uuid not null,
  manifest jsonb not null
    check (jsonb_typeof(manifest) = 'object'),
  updated_at timestamptz not null default now(),

  constraint agent_session_archive_heads_pk
    primary key (session_id, user_id),

  constraint agent_session_archive_heads_parent_fk
    foreign key (session_id, user_id)
    references public.agent_sessions (id, user_id)
    on delete cascade,

  constraint agent_session_archive_heads_manifest_shape_check
    check (
      manifest -> 'version' = '1'::jsonb
      and manifest ? 'sessionId'
      and jsonb_typeof(manifest -> 'sessionId') = 'string'
      and manifest ->> 'sessionId' = session_id
      and manifest ? 'archives'
      and jsonb_typeof(manifest -> 'archives') = 'array'
      and (
        not (manifest ? 'currentSummaryPath')
        or (
          jsonb_typeof(manifest -> 'currentSummaryPath') = 'string'
          and char_length(manifest ->> 'currentSummaryPath') >= 1
        )
      )
    )
);

-- One transaction locks the parent session, inserts immutable content, and
-- advances the manifest. A failed append can never expose a partial archive.
create or replace function public.append_agent_session_archive(
  p_session_id text,
  p_user_id uuid,
  p_archive_id text,
  p_archive_record jsonb,
  p_messages jsonb,
  p_summary text,
  p_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_manifest jsonb;
  v_next_manifest jsonb;
begin
  if p_archive_id is null
     or char_length(trim(p_archive_id)) not between 1 and 200
     or jsonb_typeof(p_archive_record) is distinct from 'object'
     or p_archive_record ->> 'id' is distinct from p_archive_id
     or jsonb_typeof(p_messages) is distinct from 'array'
     or p_summary is null
     or char_length(trim(p_summary)) < 1
     or p_created_at is null then
    raise exception 'invalid agent session archive'
      using errcode = '22023';
  end if;

  -- This parent lock serializes all appends, including creation of the first
  -- manifest head, for one exact user/session pair.
  perform 1
  from public.agent_sessions
  where id = p_session_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'agent session not found'
      using errcode = 'P0002';
  end if;

  insert into public.agent_session_archive_heads (
    session_id,
    user_id,
    manifest
  ) values (
    p_session_id,
    p_user_id,
    jsonb_build_object(
      'version', 1,
      'sessionId', p_session_id,
      'archives', jsonb_build_array()
    )
  )
  on conflict (session_id, user_id) do nothing;

  select manifest
  into v_manifest
  from public.agent_session_archive_heads
  where session_id = p_session_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'agent session archive manifest head was not created'
      using errcode = 'P0002';
  end if;

  if jsonb_typeof(v_manifest) is distinct from 'object'
     or v_manifest -> 'version' is distinct from '1'::jsonb
     or v_manifest ->> 'sessionId' is distinct from p_session_id
     or jsonb_typeof(v_manifest -> 'archives') is distinct from 'array' then
    raise exception 'invalid agent session archive manifest'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_manifest -> 'archives') as archive(value)
    where archive.value ->> 'id' = p_archive_id
  ) then
    raise exception 'agent session archive already exists'
      using errcode = '23505';
  end if;

  insert into public.agent_session_archives (
    session_id,
    user_id,
    archive_id,
    archive_record,
    messages,
    summary,
    created_at
  ) values (
    p_session_id,
    p_user_id,
    p_archive_id,
    p_archive_record,
    p_messages,
    p_summary,
    p_created_at
  );

  v_next_manifest := jsonb_build_object(
    'version', 1,
    'sessionId', p_session_id,
    'currentSummaryPath', p_archive_record ->> 'summaryPath',
    'archives', (v_manifest -> 'archives') || jsonb_build_array(p_archive_record)
  );

  update public.agent_session_archive_heads
  set manifest = v_next_manifest,
      updated_at = clock_timestamp()
  where session_id = p_session_id
    and user_id = p_user_id;

  if not found then
    raise exception 'agent session archive manifest head disappeared'
      using errcode = 'P0002';
  end if;

  return v_next_manifest;
end;
$$;

alter table public.agent_session_archives enable row level security;
alter table public.agent_session_archive_heads enable row level security;

revoke all on table public.agent_session_archives
  from public, anon, authenticated;
revoke all on table public.agent_session_archive_heads
  from public, anon, authenticated;

-- Trusted backends may read persisted state, but only the narrowly granted
-- security-definer RPC can insert content or advance the mutable head.
grant select on table public.agent_session_archives to service_role;
grant select on table public.agent_session_archive_heads to service_role;

revoke all on function public.append_agent_session_archive(
  text, uuid, text, jsonb, jsonb, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.append_agent_session_archive(
  text, uuid, text, jsonb, jsonb, text, timestamptz
) to service_role;
