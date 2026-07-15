-- Workspace template_id is the immutable official-template lineage used by
-- dashboard cards and starter protection. The editor's current visual template
-- is independent state and must not overwrite that lineage.
alter table public.presentations
add column if not exists editor_template_id text;

alter table public.presentations
drop constraint if exists presentations_editor_template_id_length_check;

alter table public.presentations
add constraint presentations_editor_template_id_length_check
check (editor_template_id is null or char_length(editor_template_id) between 1 and 160);

-- Browser editor writes must publish one complete document snapshot. Keeping
-- source/title/editor template in one CAS prevents Realtime clients from
-- observing a torn document or misclassifying their own save acknowledgement.
drop function if exists public.compare_and_swap_presentation_document(uuid, bigint, text, text, text);

create function public.compare_and_swap_presentation_document(
  target_presentation_id uuid,
  expected_source_revision bigint,
  next_source text,
  next_title text default null,
  next_editor_template_id text default null
)
returns table (
  presentation_id uuid,
  source_revision bigint,
  editor_template_id text,
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
      editor_template_id = nullif(btrim(next_editor_template_id), ''),
      source_revision = presentation.source_revision + 1
  where presentation.id = target_presentation_id
    and presentation.user_id = auth.uid()
    and presentation.source_revision = expected_source_revision
  returning
    presentation.id,
    presentation.source_revision,
    presentation.editor_template_id,
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

revoke all on function public.compare_and_swap_presentation_document(uuid, bigint, text, text, text) from public;
grant execute on function public.compare_and_swap_presentation_document(uuid, bigint, text, text, text) to authenticated, service_role;

-- Creation may set editor state directly; subsequent changes must use the CAS.
grant insert (editor_template_id) on public.presentations to authenticated;

-- Keep legacy template_id update permission during the rolling-client window.
-- It is official lineage, while new editor clients no longer write it.
