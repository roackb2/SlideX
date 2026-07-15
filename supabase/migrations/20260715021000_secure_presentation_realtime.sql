do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'presentations'
  ) then
    alter publication supabase_realtime drop table public.presentations;
  end if;
end;
$$;

drop policy if exists "workspace_presentations_receive_own_broadcasts"
on realtime.messages;

create policy "workspace_presentations_receive_own_broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = 'workspace-presentations:' || (select auth.uid())::text
);

create or replace function public.broadcast_workspace_presentation_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := coalesce(new.user_id, old.user_id);
begin
  perform realtime.broadcast_changes(
    'workspace-presentations:' || owner_id::text,
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

drop trigger if exists workspace_presentations_broadcast_changes
on public.presentations;

create trigger workspace_presentations_broadcast_changes
after insert or update or delete
on public.presentations
for each row
execute function public.broadcast_workspace_presentation_changes();
