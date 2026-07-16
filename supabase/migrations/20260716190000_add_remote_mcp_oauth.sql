create table public.mcp_oauth_clients (
  client_id text primary key check (char_length(client_id) between 12 and 200),
  client_name text not null check (char_length(trim(client_name)) between 1 and 160),
  redirect_uris text[] not null check (cardinality(redirect_uris) between 1 and 10),
  grant_types text[] not null default array['authorization_code', 'refresh_token']::text[],
  response_types text[] not null default array['code']::text[],
  token_endpoint_auth_method text not null default 'none'
    check (token_endpoint_auth_method = 'none'),
  created_at timestamptz not null default now()
);

create table public.mcp_oauth_credentials (
  id uuid primary key default extensions.gen_random_uuid(),
  credential_hash text not null unique check (char_length(credential_hash) = 64),
  credential_type text not null
    check (credential_type in ('authorization_code', 'access_token', 'refresh_token')),
  client_id text not null references public.mcp_oauth_clients (client_id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  redirect_uri text,
  code_challenge text,
  scopes text[] not null default '{}',
  resource text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index mcp_oauth_credentials_lookup_idx
  on public.mcp_oauth_credentials (credential_hash, credential_type)
  where revoked_at is null;

create index mcp_oauth_credentials_user_idx
  on public.mcp_oauth_credentials (user_id, created_at desc);

alter table public.mcp_oauth_clients enable row level security;
alter table public.mcp_oauth_credentials enable row level security;

revoke all on table public.mcp_oauth_clients from public, anon, authenticated;
revoke all on table public.mcp_oauth_credentials from public, anon, authenticated;
grant select, insert, update, delete on table public.mcp_oauth_clients to service_role;
grant select, insert, update, delete on table public.mcp_oauth_credentials to service_role;

create or replace function public.mcp_compare_and_swap_presentation_document(
  actor_user_id uuid,
  target_presentation_id uuid,
  expected_source_revision bigint,
  next_source text
)
returns table (
  presentation_id uuid,
  source_revision bigint,
  title text,
  updated_at timestamptz
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
    presentation.updated_at;

  if found then
    return;
  end if;

  perform 1
  from public.presentations as presentation
  where presentation.id = target_presentation_id
    and presentation.user_id = actor_user_id;

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

revoke all on function public.mcp_compare_and_swap_presentation_document(uuid, uuid, bigint, text)
from public, anon, authenticated;
grant execute on function public.mcp_compare_and_swap_presentation_document(uuid, uuid, bigint, text)
to service_role;

