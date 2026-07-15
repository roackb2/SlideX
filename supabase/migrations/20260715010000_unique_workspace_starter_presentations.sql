-- Each account owns at most one immutable workspace starter for an official
-- template. User-created presentations may still reuse the same template_id.
create unique index if not exists presentations_unique_workspace_starter
on public.presentations (user_id, template_id)
where kind = 'template' and template_id is not null;
