insert into public.official_templates (
  id,
  name,
  description,
  thumbnail_url,
  sort_order
)
values
  (
    'welcome-to-slidex',
    'Welcome to SlideX',
    'A guided introduction to building presentations in SlideX.',
    '/images/workspace-welcome/welcome-to-slidex.svg',
    10
  ),
  (
    'launch-deck',
    'Launch Deck',
    'A polished product launch narrative for modern teams.',
    '/images/workspace-welcome/launch-deck.svg',
    20
  )
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    thumbnail_url = excluded.thumbnail_url,
    sort_order = excluded.sort_order,
    is_active = true;
