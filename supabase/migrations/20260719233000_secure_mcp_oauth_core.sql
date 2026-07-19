create table public.mcp_oauth_security_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_type text not null check (event_type in (
    'refresh_replay',
    'invalid_grant',
    'invalid_grant_burst',
    'pkce_failure',
    'redirect_mismatch',
    'rate_limit_triggered',
    'rate_limit_burst',
    'account_ip_anomaly',
    'sensitive_environment_misconfiguration'
  )),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  request_id text check (request_id is null or char_length(request_id) between 1 and 128),
  route text not null check (char_length(route) between 1 and 120),
  error_code text check (
    error_code is null
    or error_code ~ '^[a-z0-9_]{1,64}$'
  ),
  user_hash text check (user_hash is null or user_hash ~ '^[a-f0-9]{64}$'),
  client_hash text check (client_hash is null or client_hash ~ '^[a-f0-9]{64}$'),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[a-f0-9]{64}$'),
  grant_hash text check (grant_hash is null or grant_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  check (expires_at > created_at)
);

create index mcp_oauth_security_events_recent_type_idx
  on public.mcp_oauth_security_events (event_type, created_at desc);

create index mcp_oauth_security_events_recent_client_idx
  on public.mcp_oauth_security_events (client_hash, created_at desc)
  where client_hash is not null;

create index mcp_oauth_security_events_recent_ip_idx
  on public.mcp_oauth_security_events (ip_hash, created_at desc)
  where ip_hash is not null;

create index mcp_oauth_security_events_expiry_idx
  on public.mcp_oauth_security_events (expires_at);

alter table public.mcp_oauth_security_events enable row level security;

revoke all on table public.mcp_oauth_security_events from public, anon, authenticated;
grant select, insert, update, delete on table public.mcp_oauth_security_events to service_role;

create or replace function public.mcp_record_oauth_security_event(
  security_event_type text,
  security_severity text,
  security_request_id text,
  security_route text,
  security_error_code text,
  security_user_hash text,
  security_client_hash text,
  security_ip_hash text,
  security_grant_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  recorded_event_id uuid;
begin
  insert into public.mcp_oauth_security_events (
    event_type,
    severity,
    request_id,
    route,
    error_code,
    user_hash,
    client_hash,
    ip_hash,
    grant_hash
  )
  values (
    security_event_type,
    security_severity,
    security_request_id,
    security_route,
    security_error_code,
    security_user_hash,
    security_client_hash,
    security_ip_hash,
    security_grant_hash
  )
  returning id into recorded_event_id;

  if security_event_type = 'invalid_grant'
    and (security_client_hash is not null or security_ip_hash is not null)
    and (
      select count(*)
      from public.mcp_oauth_security_events as recent_event
      where recent_event.event_type = 'invalid_grant'
        and recent_event.created_at >= clock_timestamp() - interval '5 minutes'
        and recent_event.client_hash is not distinct from security_client_hash
        and recent_event.ip_hash is not distinct from security_ip_hash
    ) >= 10
    and not exists (
      select 1
      from public.mcp_oauth_security_events as burst_event
      where burst_event.event_type = 'invalid_grant_burst'
        and burst_event.created_at >= clock_timestamp() - interval '5 minutes'
        and burst_event.client_hash is not distinct from security_client_hash
        and burst_event.ip_hash is not distinct from security_ip_hash
    ) then
    insert into public.mcp_oauth_security_events (
      event_type, severity, request_id, route, error_code,
      user_hash, client_hash, ip_hash, grant_hash
    ) values (
      'invalid_grant_burst', 'high', security_request_id, security_route,
      'invalid_grant', security_user_hash, security_client_hash,
      security_ip_hash, security_grant_hash
    );
  end if;

  if security_event_type = 'rate_limit_triggered'
    and (security_client_hash is not null or security_ip_hash is not null)
    and (
      select count(*)
      from public.mcp_oauth_security_events as recent_event
      where recent_event.event_type = 'rate_limit_triggered'
        and recent_event.created_at >= clock_timestamp() - interval '5 minutes'
        and recent_event.client_hash is not distinct from security_client_hash
        and recent_event.ip_hash is not distinct from security_ip_hash
    ) >= 5
    and not exists (
      select 1
      from public.mcp_oauth_security_events as burst_event
      where burst_event.event_type = 'rate_limit_burst'
        and burst_event.created_at >= clock_timestamp() - interval '5 minutes'
        and burst_event.client_hash is not distinct from security_client_hash
        and burst_event.ip_hash is not distinct from security_ip_hash
    ) then
    insert into public.mcp_oauth_security_events (
      event_type, severity, request_id, route, error_code,
      user_hash, client_hash, ip_hash, grant_hash
    ) values (
      'rate_limit_burst', 'high', security_request_id, security_route,
      security_error_code, security_user_hash, security_client_hash,
      security_ip_hash, security_grant_hash
    );
  end if;

  if security_user_hash is not null
    and security_ip_hash is not null
    and (
      select count(distinct recent_event.ip_hash)
      from public.mcp_oauth_security_events as recent_event
      where recent_event.user_hash = security_user_hash
        and recent_event.ip_hash is not null
        and recent_event.created_at >= clock_timestamp() - interval '10 minutes'
    ) >= 3
    and not exists (
      select 1
      from public.mcp_oauth_security_events as anomaly_event
      where anomaly_event.event_type = 'account_ip_anomaly'
        and anomaly_event.user_hash = security_user_hash
        and anomaly_event.created_at >= clock_timestamp() - interval '10 minutes'
    ) then
    insert into public.mcp_oauth_security_events (
      event_type, severity, request_id, route, error_code,
      user_hash, client_hash, ip_hash, grant_hash
    ) values (
      'account_ip_anomaly', 'high', security_request_id, security_route,
      security_error_code, security_user_hash, security_client_hash,
      security_ip_hash, security_grant_hash
    );
  end if;

  return recorded_event_id;
end;
$$;

create or replace function public.mcp_exchange_oauth_authorization_code(
  presented_code_hash text,
  oauth_client_id text,
  oauth_redirect_uri text,
  oauth_resource text,
  presented_code_challenge text,
  issued_access_hash text,
  issued_access_expires_at timestamptz,
  issued_refresh_hash text,
  issued_refresh_expires_at timestamptz
)
returns table (
  result_status text,
  granted_scopes text[],
  security_user_id uuid,
  security_grant_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  credential public.mcp_oauth_credentials%rowtype;
  now_at timestamptz := clock_timestamp();
begin
  if presented_code_hash !~ '^[a-f0-9]{64}$'
    or issued_access_hash !~ '^[a-f0-9]{64}$'
    or issued_refresh_hash !~ '^[a-f0-9]{64}$'
    or presented_code_challenge !~ '^[A-Za-z0-9_-]{43}$'
    or oauth_client_id is null
    or char_length(oauth_client_id) > 200
    or oauth_redirect_uri is null
    or oauth_resource is null
    or issued_access_expires_at <= now_at
    or issued_refresh_expires_at <= now_at then
    return query select 'invalid_grant', null::text[], null::uuid, null::uuid;
    return;
  end if;

  select candidate.*
  into credential
  from public.mcp_oauth_credentials as candidate
  where candidate.credential_hash = presented_code_hash
    and candidate.credential_type = 'authorization_code'
  for update;

  if not found then
    return query select 'invalid_grant', null::text[], null::uuid, null::uuid;
    return;
  end if;

  if credential.revoked_at is not null
    or credential.expires_at <= now_at
    or credential.client_id <> oauth_client_id
    or not exists (
      select 1
      from public.mcp_oauth_clients as oauth_client
      where oauth_client.client_id = oauth_client_id
        and 'authorization_code' = any(oauth_client.grant_types)
    ) then
    return query select 'invalid_grant', null::text[], credential.user_id, credential.grant_id;
    return;
  end if;

  if credential.redirect_uri is distinct from oauth_redirect_uri then
    return query select 'redirect_mismatch', null::text[], credential.user_id, credential.grant_id;
    return;
  end if;

  if credential.resource <> oauth_resource then
    return query select 'invalid_grant', null::text[], credential.user_id, credential.grant_id;
    return;
  end if;

  if credential.code_challenge is null
    or credential.code_challenge <> presented_code_challenge then
    return query select 'pkce_failure', null::text[], credential.user_id, credential.grant_id;
    return;
  end if;

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
      credential.scopes,
      credential.user_id
    ),
    (
      credential.client_id,
      issued_refresh_hash,
      'refresh_token',
      issued_refresh_expires_at,
      credential.grant_id,
      credential.resource,
      credential.scopes,
      credential.user_id
    );

  return query select 'exchanged', credential.scopes, credential.user_id, credential.grant_id;
end;
$$;

-- PostgreSQL cannot change a function's TABLE return type with CREATE OR REPLACE.
-- The prior function is recreated in this same forward-only migration so callers
-- never observe a partially upgraded contract.
drop function if exists public.mcp_rotate_oauth_refresh_token(
  text, text, text, text[], text, timestamptz, text, timestamptz
);

create function public.mcp_rotate_oauth_refresh_token(
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
  granted_scopes text[],
  security_user_id uuid,
  security_grant_id uuid
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
  if presented_refresh_hash !~ '^[a-f0-9]{64}$'
    or issued_access_hash !~ '^[a-f0-9]{64}$'
    or issued_refresh_hash !~ '^[a-f0-9]{64}$'
    or oauth_client_id is null
    or char_length(oauth_client_id) > 200
    or oauth_resource is null
    or issued_access_expires_at is null
    or issued_refresh_expires_at is null
    or issued_access_expires_at <= now_at
    or issued_refresh_expires_at <= now_at then
    return query select 'invalid_grant', null::text[], null::uuid, null::uuid;
    return;
  end if;

  select candidate.*
  into credential
  from public.mcp_oauth_credentials as candidate
  where candidate.credential_hash = presented_refresh_hash
    and candidate.credential_type = 'refresh_token'
  for update;

  if not found then
    return query select 'invalid_grant', null::text[], null::uuid, null::uuid;
    return;
  end if;

  if credential.revoked_at is not null then
    update public.mcp_oauth_credentials as family_credential
    set revoked_at = now_at
    where family_credential.grant_id = credential.grant_id
      and family_credential.revoked_at is null;

    return query select 'refresh_replay', null::text[], credential.user_id, credential.grant_id;
    return;
  end if;

  if credential.expires_at <= now_at
    or credential.client_id <> oauth_client_id
    or credential.resource is distinct from oauth_resource
    or not exists (
      select 1
      from public.mcp_oauth_clients as oauth_client
      where oauth_client.client_id = oauth_client_id
        and 'refresh_token' = any(oauth_client.grant_types)
    ) then
    return query select 'invalid_grant', null::text[], credential.user_id, credential.grant_id;
    return;
  end if;

  if requested_scopes is not null and not requested_scopes <@ credential.scopes then
    return query select 'invalid_scope', null::text[], credential.user_id, credential.grant_id;
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

  return query select 'rotated', next_scopes, credential.user_id, credential.grant_id;
end;
$$;

create or replace function public.mcp_revoke_oauth_grant_family(
  presented_credential_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  credential public.mcp_oauth_credentials%rowtype;
begin
  if presented_credential_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  select candidate.*
  into credential
  from public.mcp_oauth_credentials as candidate
  where candidate.credential_hash = presented_credential_hash
  for update;

  if not found then
    return false;
  end if;

  update public.mcp_oauth_credentials as family_credential
  set revoked_at = coalesce(family_credential.revoked_at, clock_timestamp())
  where family_credential.grant_id = credential.grant_id
    and family_credential.revoked_at is null;

  return true;
end;
$$;

revoke all on function public.mcp_record_oauth_security_event(
  text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.mcp_record_oauth_security_event(
  text, text, text, text, text, text, text, text, text
) to service_role;

revoke all on function public.mcp_exchange_oauth_authorization_code(
  text, text, text, text, text, text, timestamptz, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.mcp_exchange_oauth_authorization_code(
  text, text, text, text, text, text, timestamptz, text, timestamptz
) to service_role;

revoke all on function public.mcp_rotate_oauth_refresh_token(
  text, text, text, text[], text, timestamptz, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.mcp_rotate_oauth_refresh_token(
  text, text, text, text[], text, timestamptz, text, timestamptz
) to service_role;

revoke all on function public.mcp_revoke_oauth_grant_family(text)
from public, anon, authenticated;
grant execute on function public.mcp_revoke_oauth_grant_family(text)
to service_role;
