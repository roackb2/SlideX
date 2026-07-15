do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'slide_comments'
  ) then
    alter publication supabase_realtime add table public.slide_comments;
  end if;
end;
$$;
