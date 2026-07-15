-- The workspace intentionally exposes only the two maintained starter decks.
-- Existing user presentations are preserved: presentations.template_id uses
-- ON DELETE SET NULL when an obsolete catalog entry is removed.
delete from public.official_templates
where id not in ('welcome-to-slidex', 'launch-deck');
