create extension if not exists pg_cron;

create table public.mcp_operation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  presentation_id uuid not null references public.presentations(id) on delete cascade,
  client_id text not null check (char_length(client_id) between 1 and 180),
  client_name text not null check (char_length(client_name) between 1 and 160),
  tool_name text not null check (char_length(tool_name) between 1 and 120),
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  target_kind text not null check (target_kind in ('presentation', 'slide', 'block')),
  slide_index integer check (slide_index is null or slide_index >= 0),
  node_id text check (node_id is null or char_length(node_id) between 1 and 200),
  completed_revision bigint check (completed_revision is null or completed_revision >= 0),
  error_code text check (error_code is null or char_length(error_code) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  constraint mcp_operation_events_target_shape check (
    (target_kind = 'presentation' and slide_index is null and node_id is null)
    or (target_kind = 'slide' and slide_index is not null and node_id is null)
    or (target_kind = 'block' and slide_index is not null and node_id is not null)
  ),
  constraint mcp_operation_events_status_shape check (
    (status = 'running' and completed_revision is null and error_code is null and completed_at is null)
    or (status = 'completed' and error_code is null and completed_at is not null)
    or (status = 'failed' and completed_revision is null and error_code is not null and completed_at is not null)
  )
);

create index mcp_operation_events_user_created_idx
  on public.mcp_operation_events (user_id, created_at desc);

create index mcp_operation_events_presentation_created_idx
  on public.mcp_operation_events (presentation_id, created_at desc);

create index mcp_operation_events_expiry_idx
  on public.mcp_operation_events (expires_at);

alter table public.mcp_operation_events enable row level security;

revoke all on table public.mcp_operation_events from public, anon, authenticated;
grant select on table public.mcp_operation_events to authenticated;
grant select, insert, update, delete on table public.mcp_operation_events to service_role;

create policy "mcp_operation_events_select_own_unexpired"
on public.mcp_operation_events
for select
to authenticated
using (
  user_id = (select auth.uid())
  and expires_at > statement_timestamp()
);

create or replace function public.enforce_mcp_operation_event_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.created_at := statement_timestamp();
  new.updated_at := new.created_at;
  new.expires_at := new.created_at + interval '7 days';

  if not exists (
    select 1
    from public.presentations
    where id = new.presentation_id
      and user_id = new.user_id
  ) then
    raise exception 'presentation not owned by operation event user' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger mcp_operation_events_enforce_owner
before insert on public.mcp_operation_events
for each row
execute function public.enforce_mcp_operation_event_owner();

create or replace function public.enforce_mcp_operation_event_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status <> 'running' or new.status not in ('completed', 'failed') then
    raise exception 'invalid mcp operation event transition' using errcode = '23514';
  end if;

  if new.user_id <> old.user_id
    or new.presentation_id <> old.presentation_id
    or new.client_id <> old.client_id
    or new.client_name <> old.client_name
    or new.tool_name <> old.tool_name
    or new.created_at <> old.created_at
    or new.expires_at <> old.expires_at then
    raise exception 'immutable mcp operation event identity' using errcode = '23514';
  end if;

  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create trigger mcp_operation_events_enforce_transition
before update on public.mcp_operation_events
for each row
execute function public.enforce_mcp_operation_event_transition();

create or replace function public.broadcast_mcp_operation_event_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := coalesce(new.user_id, old.user_id);
begin
  perform realtime.broadcast_changes(
    'mcp-operation-events:' || owner_id::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return null;
end;
$$;

create trigger mcp_operation_events_broadcast_changes
after insert or update or delete
on public.mcp_operation_events
for each row
execute function public.broadcast_mcp_operation_event_changes();

create policy "mcp_operation_events_receive_own_broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = 'mcp-operation-events:' || (select auth.uid())::text
);

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'purge-expired-mcp-operation-events';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'purge-expired-mcp-operation-events',
    '0 * * * *',
    $cleanup$delete from public.mcp_operation_events where expires_at <= statement_timestamp()$cleanup$
  );
end;
$$;
