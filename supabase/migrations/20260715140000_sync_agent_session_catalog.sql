-- Keep SlideX's creator-private session index aligned with Heddle without
-- copying conversation messages into PostgreSQL. A single RPC makes catalog
-- repair atomic and prevents slower, older browser writes from reducing the
-- recorded message count.
create or replace function public.sync_agent_session_catalog(entries jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  entry_count integer;
begin
  if current_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication_required';
  end if;

  if jsonb_typeof(entries) is distinct from 'array' then
    raise exception using
      errcode = '22023',
      message = 'agent_session_catalog_must_be_an_array';
  end if;

  select count(*)
  into entry_count
  from jsonb_to_recordset(entries) as entry (
    id text,
    presentation_id uuid,
    title text,
    message_count integer
  );

  if entry_count <> (
    select count(distinct entry.id)
    from jsonb_to_recordset(entries) as entry (
      id text,
      presentation_id uuid,
      title text,
      message_count integer
    )
  ) then
    raise exception using
      errcode = '22023',
      message = 'duplicate_agent_session_catalog_entry';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(entries) as entry (
      id text,
      presentation_id uuid,
      title text,
      message_count integer
    )
    where entry.id is null
      or char_length(trim(entry.id)) not between 1 and 200
      or entry.presentation_id is null
      or entry.title is null
      or char_length(trim(entry.title)) not between 1 and 240
      or entry.message_count is null
      or entry.message_count < 0
  ) then
    raise exception using
      errcode = '22023',
      message = 'invalid_agent_session_catalog_entry';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(entries) as entry (
      id text,
      presentation_id uuid,
      title text,
      message_count integer
    )
    left join public.presentations as presentation
      on presentation.id = entry.presentation_id
      and presentation.user_id = current_user_id
    where presentation.id is null
  ) then
    raise exception using
      errcode = '42501',
      message = 'agent_session_presentation_unavailable';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(entries) as entry (
      id text,
      presentation_id uuid,
      title text,
      message_count integer
    )
    join public.agent_sessions as session on session.id = entry.id
    where session.user_id <> current_user_id
      or session.presentation_id <> entry.presentation_id
  ) then
    raise exception using
      errcode = '23505',
      message = 'agent_session_identity_conflict';
  end if;

  insert into public.agent_sessions as session (
    id,
    user_id,
    presentation_id,
    title,
    message_count
  )
  select
    entry.id,
    current_user_id,
    entry.presentation_id,
    entry.title,
    entry.message_count
  from jsonb_to_recordset(entries) as entry (
    id text,
    presentation_id uuid,
    title text,
    message_count integer
  )
  on conflict (id) do update
  set title = excluded.title,
      message_count = excluded.message_count
  where session.user_id = current_user_id
    and session.presentation_id = excluded.presentation_id
    and (
      excluded.message_count > session.message_count
      or (
        excluded.message_count = session.message_count
        and excluded.title is distinct from session.title
      )
    );
end;
$$;

revoke all on function public.sync_agent_session_catalog(jsonb) from public;
grant execute on function public.sync_agent_session_catalog(jsonb) to authenticated;

-- Catalog writes must use the function above so clients cannot recreate the
-- former read-then-write race or reduce message_count with a stale response.
revoke insert (id, presentation_id, title)
  on public.agent_sessions from authenticated;
revoke update (title, message_count)
  on public.agent_sessions from authenticated;
