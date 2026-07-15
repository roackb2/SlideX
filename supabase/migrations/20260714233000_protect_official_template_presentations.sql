alter table public.presentations
  add column if not exists kind text not null default 'presentation';

alter table public.presentations
  drop constraint if exists presentations_kind_check;

alter table public.presentations
  add constraint presentations_kind_check
  check (kind in ('presentation', 'template'));

grant insert (kind) on public.presentations to authenticated;

-- These are the two maintained workspace starter rows. Existing user-created
-- decks remain deletable even when they were originally based on a template.
update public.presentations
set kind = 'template'
where kind = 'presentation'
  and (
    (template_id = 'welcome-to-slidex' and title = 'Welcome to SlideX')
    or (template_id = 'launch-deck' and title = 'Launch Deck')
  );
