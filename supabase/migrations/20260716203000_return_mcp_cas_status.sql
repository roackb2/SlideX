drop function if exists public.mcp_compare_and_swap_presentation_document(uuid, uuid, bigint, text);

create function public.mcp_compare_and_swap_presentation_document(
  actor_user_id uuid,
  target_presentation_id uuid,
  expected_source_revision bigint,
  next_source text
)
returns table (
  presentation_id uuid,
  source_revision bigint,
  title text,
  updated_at timestamptz,
  result_status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.presentations as presentation
  set source = next_source,
      source_revision = presentation.source_revision + 1
  where presentation.id = target_presentation_id
    and presentation.user_id = actor_user_id
    and presentation.source_revision = expected_source_revision
  returning
    presentation.id,
    presentation.source_revision,
    presentation.title,
    presentation.updated_at,
    'saved'::text;

  if found then
    return;
  end if;

  if exists (
    select 1
    from public.presentations as presentation
    where presentation.id = target_presentation_id
      and presentation.user_id = actor_user_id
  ) then
    return query select
      target_presentation_id,
      null::bigint,
      null::text,
      null::timestamptz,
      'conflict'::text;
    return;
  end if;

  return query select
    target_presentation_id,
    null::bigint,
    null::text,
    null::timestamptz,
    'inaccessible'::text;
end;
$$;

revoke all on function public.mcp_compare_and_swap_presentation_document(uuid, uuid, bigint, text)
from public, anon, authenticated;
grant execute on function public.mcp_compare_and_swap_presentation_document(uuid, uuid, bigint, text)
to service_role;
