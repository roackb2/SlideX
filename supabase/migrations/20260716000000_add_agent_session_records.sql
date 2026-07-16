-- Keep the browser-readable session catalog separate from the complete Heddle
-- ChatSession record. This table is intentionally accessible only to trusted
-- backend code using the service role.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.agent_sessions'::regclass
      and conname = 'agent_sessions_id_user_id_key'
  ) then
    alter table public.agent_sessions
      add constraint agent_sessions_id_user_id_key unique (id, user_id);
  end if;
end;
$$;

create table public.agent_session_records (
  session_id text primary key
    check (char_length(trim(session_id)) between 1 and 200),
  user_id uuid not null,

  -- Heddle's optimistic-concurrency revision. This is independent from
  -- presentations.source_revision.
  revision bigint not null default 1 check (revision >= 1),

  -- Query projections used by ChatSessionRepository.list(). The adapter must
  -- update these values, catalog, and record in one database write.
  name text not null
    check (char_length(trim(name)) between 1 and 240),
  workspace_id text,
  retention text
    check (retention is null or retention in ('reusable', 'one_off')),
  pinned boolean not null default false,
  archived_at timestamptz,
  session_created_at timestamptz not null,
  session_updated_at timestamptz not null,

  record_format integer not null default 1 check (record_format >= 1),
  catalog jsonb not null check (jsonb_typeof(catalog) = 'object'),
  record jsonb not null check (jsonb_typeof(record) = 'object'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint agent_session_records_parent_fk
    foreign key (session_id, user_id)
    references public.agent_sessions (id, user_id)
    on delete cascade,

  constraint agent_session_records_id_matches_record_check
    check (
      record ? 'id'
      and jsonb_typeof(record -> 'id') = 'string'
      and record ->> 'id' = session_id
    ),

  constraint agent_session_records_id_matches_catalog_check
    check (
      catalog ? 'id'
      and jsonb_typeof(catalog -> 'id') = 'string'
      and catalog ->> 'id' = session_id
    ),

  constraint agent_session_records_name_matches_catalog_check
    check (
      catalog ? 'name'
      and jsonb_typeof(catalog -> 'name') = 'string'
      and catalog ->> 'name' = name
    ),

  constraint agent_session_records_revision_matches_catalog_check
    check (
      catalog ? 'revision'
      and catalog -> 'revision' = to_jsonb(revision)
    )
);

create index agent_session_records_user_list_idx
  on public.agent_session_records (
    user_id,
    pinned desc,
    session_updated_at desc,
    session_id asc
  );

create index agent_session_records_user_workspace_list_idx
  on public.agent_session_records (
    user_id,
    workspace_id,
    pinned desc,
    session_updated_at desc,
    session_id asc
  );

create trigger agent_session_records_set_updated_at
before update on public.agent_session_records
for each row execute function public.set_updated_at();

alter table public.agent_session_records enable row level security;

revoke all on public.agent_session_records from anon, authenticated;
grant all on public.agent_session_records to service_role;
