-- Store only the completed, user-visible Agent conversation separately from
-- the browser-readable session catalog and Heddle's opaque session record.

create table public.agent_session_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id text not null,
  user_id uuid not null,
  run_id text not null
    check (char_length(trim(run_id)) between 1 and 200),
  kind text not null
    check (kind in ('user_input', 'assistant_terminal')),
  role text not null
    check (role in ('user', 'assistant')),
  ordinal bigint not null check (ordinal >= 1),
  content text not null
    check (char_length(content) between 1 and 50000),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),

  constraint agent_session_messages_parent_fk
    foreign key (session_id, user_id)
    references public.agent_sessions (id, user_id)
    on delete cascade,

  constraint agent_session_messages_kind_role_check
    check (
      (kind = 'user_input' and role = 'user')
      or
      (kind = 'assistant_terminal' and role = 'assistant')
    ),

  constraint agent_session_messages_ordinal_key
    unique (session_id, user_id, ordinal),

  constraint agent_session_messages_run_kind_key
    unique (session_id, user_id, run_id, kind)
);

create index agent_session_messages_user_session_list_idx
  on public.agent_session_messages (user_id, session_id, ordinal asc);

create or replace function public.append_agent_session_message(
  p_session_id text,
  p_user_id uuid,
  p_run_id text,
  p_kind text,
  p_role text,
  p_content text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.agent_session_messages
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existing public.agent_session_messages;
  v_message public.agent_session_messages;
  v_next_ordinal bigint;
begin
  -- Serialize every append for this exact user/session. This also proves the
  -- parent exists before a child message is created.
  perform 1
  from public.agent_sessions
  where id = p_session_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'agent session not found'
      using errcode = 'P0002';
  end if;

  select *
  into v_existing
  from public.agent_session_messages
  where session_id = p_session_id
    and user_id = p_user_id
    and run_id = p_run_id
    and kind = p_kind;

  if found then
    if v_existing.role <> p_role
       or v_existing.content <> p_content
       or v_existing.metadata <> coalesce(p_metadata, '{}'::jsonb) then
      raise exception 'agent message idempotency conflict'
        using errcode = '23505';
    end if;

    return v_existing;
  end if;

  select coalesce(max(ordinal), 0) + 1
  into v_next_ordinal
  from public.agent_session_messages
  where session_id = p_session_id
    and user_id = p_user_id;

  insert into public.agent_session_messages (
    session_id,
    user_id,
    run_id,
    kind,
    role,
    ordinal,
    content,
    metadata
  ) values (
    p_session_id,
    p_user_id,
    p_run_id,
    p_kind,
    p_role,
    v_next_ordinal,
    p_content,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_message;

  update public.agent_sessions
  set message_count = (
        select count(*)::integer
        from public.agent_session_messages
        where session_id = p_session_id
          and user_id = p_user_id
      ),
      updated_at = now()
  where id = p_session_id
    and user_id = p_user_id;

  return v_message;
end;
$$;

alter table public.agent_session_messages enable row level security;

revoke all on public.agent_session_messages from anon, authenticated;
grant all on public.agent_session_messages to service_role;

revoke all on function public.append_agent_session_message(
  text, uuid, text, text, text, text, jsonb
) from public, anon, authenticated;

grant execute on function public.append_agent_session_message(
  text, uuid, text, text, text, text, jsonb
) to service_role;
