update public.mcp_oauth_credentials
set resource = regexp_replace(resource, '/mcp/$', '/mcp')
where resource ~ '/mcp/$';

alter table public.mcp_oauth_credentials
add column grant_id uuid;

with paired_credentials as (
  select
    array_agg(credential.id) as credential_ids,
    extensions.gen_random_uuid() as grant_id
  from public.mcp_oauth_credentials as credential
  where credential.credential_type in ('access_token', 'refresh_token')
  group by
    credential.client_id,
    credential.user_id,
    credential.resource,
    credential.scopes,
    credential.created_at
  having count(*) = 2
    and count(*) filter (where credential.credential_type = 'access_token') = 1
    and count(*) filter (where credential.credential_type = 'refresh_token') = 1
)
update public.mcp_oauth_credentials as credential
set grant_id = pair.grant_id
from paired_credentials as pair
where credential.id = any(pair.credential_ids);

update public.mcp_oauth_credentials
set grant_id = extensions.gen_random_uuid()
where grant_id is null;

alter table public.mcp_oauth_credentials
alter column grant_id set default extensions.gen_random_uuid(),
alter column grant_id set not null;

create index mcp_oauth_credentials_active_grant_idx
  on public.mcp_oauth_credentials (grant_id, credential_type)
  where revoked_at is null;

create table public.mcp_oauth_consent_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  nonce_hash text not null unique check (char_length(nonce_hash) = 64),
  request_hash text not null check (char_length(request_hash) = 64),
  client_id text not null references public.mcp_oauth_clients (client_id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index mcp_oauth_consent_requests_expiry_idx
  on public.mcp_oauth_consent_requests (expires_at)
  where consumed_at is null;

create table public.mcp_oauth_rate_limits (
  bucket_hash text primary key check (char_length(bucket_hash) = 64),
  tokens integer not null check (tokens >= 0),
  last_refilled_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mcp_oauth_rate_limits_updated_idx
  on public.mcp_oauth_rate_limits (updated_at);

alter table public.mcp_oauth_consent_requests enable row level security;
alter table public.mcp_oauth_rate_limits enable row level security;

revoke all on table public.mcp_oauth_consent_requests from public, anon, authenticated;
revoke all on table public.mcp_oauth_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.mcp_oauth_consent_requests to service_role;
grant select, insert, update, delete on table public.mcp_oauth_rate_limits to service_role;

create or replace function public.mcp_rotate_oauth_refresh_token(
  presented_refresh_hash text,
  oauth_client_id text,
  oauth_resource text,
  requested_scopes text[],
  issued_access_hash text,
  issued_access_expires_at timestamptz,
  issued_refresh_hash text,
  issued_refresh_expires_at timestamptz
)
returns table (
  result_status text,
  granted_scopes text[]
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  credential public.mcp_oauth_credentials%rowtype;
  next_scopes text[];
  now_at timestamptz := clock_timestamp();
begin
  if char_length(presented_refresh_hash) <> 64
    or char_length(issued_access_hash) <> 64
    or char_length(issued_refresh_hash) <> 64 then
    return query select 'invalid_grant', null::text[];
    return;
  end if;

  select candidate.*
  into credential
  from public.mcp_oauth_credentials as candidate
  where candidate.credential_hash = presented_refresh_hash
    and candidate.credential_type = 'refresh_token'
  for update;

  if not found then
    return query select 'invalid_grant', null::text[];
    return;
  end if;

  if credential.revoked_at is not null then
    update public.mcp_oauth_credentials as family_credential
    set revoked_at = now_at
    where family_credential.grant_id = credential.grant_id
      and family_credential.revoked_at is null;

    return query select 'invalid_grant', null::text[];
    return;
  end if;

  if credential.expires_at <= now_at
    or credential.client_id <> oauth_client_id
    or credential.resource <> oauth_resource
    or not exists (
      select 1
      from public.mcp_oauth_clients as oauth_client
      where oauth_client.client_id = oauth_client_id
        and 'refresh_token' = any(oauth_client.grant_types)
    ) then
    return query select 'invalid_grant', null::text[];
    return;
  end if;

  if requested_scopes is not null and not requested_scopes <@ credential.scopes then
    return query select 'invalid_scope', null::text[];
    return;
  end if;

  next_scopes := coalesce(requested_scopes, credential.scopes);

  update public.mcp_oauth_credentials
  set revoked_at = now_at
  where id = credential.id;

  insert into public.mcp_oauth_credentials (
    client_id,
    credential_hash,
    credential_type,
    expires_at,
    grant_id,
    resource,
    scopes,
    user_id
  )
  values
    (
      credential.client_id,
      issued_access_hash,
      'access_token',
      issued_access_expires_at,
      credential.grant_id,
      credential.resource,
      next_scopes,
      credential.user_id
    ),
    (
      credential.client_id,
      issued_refresh_hash,
      'refresh_token',
      issued_refresh_expires_at,
      credential.grant_id,
      credential.resource,
      next_scopes,
      credential.user_id
    );

  return query select 'rotated', next_scopes;
end;
$$;

create or replace function public.mcp_issue_oauth_consent_request(
  consent_nonce_hash text,
  authorization_request_hash text,
  oauth_client_id text,
  actor_user_id uuid,
  consent_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_at timestamptz := clock_timestamp();
begin
  if char_length(consent_nonce_hash) <> 64
    or char_length(authorization_request_hash) <> 64
    or consent_expires_at <= now_at
    or consent_expires_at > now_at + interval '11 minutes' then
    return false;
  end if;

  delete from public.mcp_oauth_consent_requests as consent
  where consent.id in (
    select expired.id
    from public.mcp_oauth_consent_requests as expired
    where expired.expires_at < now_at - interval '1 day'
      or (expired.consumed_at is not null and expired.consumed_at < now_at - interval '1 hour')
    order by expired.created_at
    limit 100
  );

  insert into public.mcp_oauth_consent_requests (
    nonce_hash,
    request_hash,
    client_id,
    user_id,
    expires_at
  )
  values (
    consent_nonce_hash,
    authorization_request_hash,
    oauth_client_id,
    actor_user_id,
    consent_expires_at
  );

  return true;
end;
$$;

create or replace function public.mcp_consume_oauth_consent_request(
  consent_nonce_hash text,
  authorization_request_hash text,
  oauth_client_id text,
  actor_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  consumed_id uuid;
begin
  update public.mcp_oauth_consent_requests as consent
  set consumed_at = clock_timestamp()
  where consent.nonce_hash = consent_nonce_hash
    and consent.request_hash = authorization_request_hash
    and consent.client_id = oauth_client_id
    and consent.user_id = actor_user_id
    and consent.consumed_at is null
    and consent.expires_at > clock_timestamp()
  returning consent.id into consumed_id;

  return consumed_id is not null;
end;
$$;

create or replace function public.mcp_consume_oauth_rate_limit(
  target_bucket_hash text,
  bucket_capacity integer,
  refill_interval_seconds integer
)
returns table (
  allowed boolean,
  tokens_remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_at timestamptz := clock_timestamp();
  current_tokens integer;
  last_refill timestamptz;
  elapsed_refills integer;
begin
  if char_length(target_bucket_hash) <> 64
    or bucket_capacity < 1
    or bucket_capacity > 1000
    or refill_interval_seconds < 1
    or refill_interval_seconds > 86400 then
    raise exception using errcode = '22023', message = 'invalid_oauth_rate_limit';
  end if;

  delete from public.mcp_oauth_rate_limits as bucket
  where bucket.bucket_hash in (
    select expired.bucket_hash
    from public.mcp_oauth_rate_limits as expired
    where expired.updated_at < now_at - interval '1 day'
    order by expired.updated_at
    limit 100
  );

  insert into public.mcp_oauth_rate_limits (
    bucket_hash,
    tokens,
    last_refilled_at,
    updated_at
  )
  values (target_bucket_hash, bucket_capacity, now_at, now_at)
  on conflict (bucket_hash) do nothing;

  select bucket.tokens, bucket.last_refilled_at
  into current_tokens, last_refill
  from public.mcp_oauth_rate_limits as bucket
  where bucket.bucket_hash = target_bucket_hash
  for update;

  elapsed_refills := greatest(
    0,
    floor(extract(epoch from (now_at - last_refill)) / refill_interval_seconds)::integer
  );
  if elapsed_refills > 0 then
    current_tokens := least(bucket_capacity, current_tokens + elapsed_refills);
    last_refill := last_refill + make_interval(secs => elapsed_refills * refill_interval_seconds);
  end if;

  if current_tokens < 1 then
    update public.mcp_oauth_rate_limits as bucket
    set tokens = current_tokens,
        last_refilled_at = last_refill,
        updated_at = now_at
    where bucket.bucket_hash = target_bucket_hash;

    return query select
      false,
      0,
      greatest(
        1,
        ceil(refill_interval_seconds - extract(epoch from (now_at - last_refill)))::integer
      );
    return;
  end if;

  update public.mcp_oauth_rate_limits as bucket
  set tokens = current_tokens - 1,
      last_refilled_at = last_refill,
      updated_at = now_at
  where bucket.bucket_hash = target_bucket_hash;

  return query select true, current_tokens - 1, 0;
end;
$$;

revoke all on function public.mcp_rotate_oauth_refresh_token(
  text, text, text, text[], text, timestamptz, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.mcp_rotate_oauth_refresh_token(
  text, text, text, text[], text, timestamptz, text, timestamptz
) to service_role;

revoke all on function public.mcp_issue_oauth_consent_request(
  text, text, text, uuid, timestamptz
) from public, anon, authenticated;
grant execute on function public.mcp_issue_oauth_consent_request(
  text, text, text, uuid, timestamptz
) to service_role;

revoke all on function public.mcp_consume_oauth_consent_request(
  text, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.mcp_consume_oauth_consent_request(
  text, text, text, uuid
) to service_role;

revoke all on function public.mcp_consume_oauth_rate_limit(
  text, integer, integer
) from public, anon, authenticated;
grant execute on function public.mcp_consume_oauth_rate_limit(
  text, integer, integer
) to service_role;
