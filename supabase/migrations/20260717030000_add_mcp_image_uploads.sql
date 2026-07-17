create table public.mcp_image_upload_rate_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tokens smallint not null default 20 check (tokens between 0 and 20),
  last_refilled_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mcp_image_upload_intents (
  id uuid primary key default extensions.gen_random_uuid(),
  token_hash text not null unique check (char_length(token_hash) = 64),
  user_id uuid not null references auth.users (id) on delete cascade,
  presentation_id uuid not null references public.presentations (id) on delete cascade,
  expected_mime_type text not null
    check (expected_mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  expected_size bigint not null check (expected_size between 1 and 10485760),
  actual_size bigint check (actual_size between 1 and 10485760),
  storage_path text not null unique
    check (
      storage_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]webp$'
    ),
  status text not null default 'prepared'
    check (status in ('prepared', 'claimed', 'completed', 'rejected', 'expired')),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mcp_image_upload_intents_user_created_idx
  on public.mcp_image_upload_intents (user_id, created_at desc);

create index mcp_image_upload_intents_active_idx
  on public.mcp_image_upload_intents (user_id, status, expires_at)
  where status in ('prepared', 'claimed');

alter table public.mcp_image_upload_rate_limits enable row level security;
alter table public.mcp_image_upload_intents enable row level security;

revoke all on table public.mcp_image_upload_rate_limits from public, anon, authenticated;
revoke all on table public.mcp_image_upload_intents from public, anon, authenticated;
grant select, insert, update, delete on table public.mcp_image_upload_rate_limits to service_role;
grant select, insert, update, delete on table public.mcp_image_upload_intents to service_role;

create or replace function public.mcp_prepare_presentation_image_upload(
  actor_user_id uuid,
  target_presentation_id uuid,
  credential_hash text,
  requested_mime_type text,
  requested_size bigint
)
returns table (
  result_status text,
  upload_id uuid,
  storage_path text,
  expires_at timestamptz,
  tokens_remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  bucket_capacity constant integer := 20;
  refill_seconds constant integer := 30;
  image_quota_bytes constant bigint := 1073741824;
  current_time timestamptz := clock_timestamp();
  current_tokens integer;
  elapsed_refills integer;
  last_refill timestamptz;
  next_upload_id uuid;
  next_expires_at timestamptz;
  next_storage_path text;
  reserved_bytes bigint;
  stored_bytes bigint;
begin
  if char_length(credential_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_upload_credential';
  end if;
  if requested_mime_type not in ('image/jpeg', 'image/png', 'image/webp') then
    raise exception using errcode = '22023', message = 'unsupported_image_type';
  end if;
  if requested_size < 1 or requested_size > 10485760 then
    raise exception using errcode = '22023', message = 'invalid_image_size';
  end if;

  if not exists (
    select 1
    from public.presentations as presentation
    where presentation.id = target_presentation_id
      and presentation.user_id = actor_user_id
  ) then
    return query select 'inaccessible', null::uuid, null::text, null::timestamptz, null::integer, null::integer;
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor_user_id::text, 0));

  update public.mcp_image_upload_intents as intent
  set status = 'expired',
      updated_at = current_time
  where intent.user_id = actor_user_id
    and intent.status = 'prepared'
    and intent.expires_at <= current_time;

  update public.mcp_image_upload_intents as intent
  set status = 'rejected',
      updated_at = current_time
  where intent.user_id = actor_user_id
    and intent.status = 'claimed'
    and intent.claimed_at < current_time - interval '15 minutes';

  delete from public.mcp_image_upload_intents as intent
  where intent.user_id = actor_user_id
    and (
      (intent.status in ('expired', 'rejected') and intent.updated_at < current_time - interval '24 hours')
      or (intent.status = 'completed' and intent.completed_at < current_time - interval '30 days')
    );

  insert into public.mcp_image_upload_rate_limits (
    user_id,
    tokens,
    last_refilled_at,
    updated_at
  )
  values (actor_user_id, bucket_capacity, current_time, current_time)
  on conflict (user_id) do nothing;

  select rate_limit.tokens, rate_limit.last_refilled_at
  into current_tokens, last_refill
  from public.mcp_image_upload_rate_limits as rate_limit
  where rate_limit.user_id = actor_user_id
  for update;

  elapsed_refills := greatest(
    0,
    floor(extract(epoch from (current_time - last_refill)) / refill_seconds)::integer
  );
  if elapsed_refills > 0 then
    current_tokens := least(bucket_capacity, current_tokens + elapsed_refills);
    last_refill := last_refill + make_interval(secs => elapsed_refills * refill_seconds);
  end if;

  update public.mcp_image_upload_rate_limits as rate_limit
  set tokens = current_tokens,
      last_refilled_at = last_refill,
      updated_at = current_time
  where rate_limit.user_id = actor_user_id;

  if current_tokens < 1 then
    return query select
      'rate_limited',
      null::uuid,
      null::text,
      null::timestamptz,
      0,
      greatest(
        1,
        ceil(refill_seconds - extract(epoch from (current_time - last_refill)))::integer
      );
    return;
  end if;

  select coalesce(sum(
    case
      when storage_object.metadata ->> 'size' ~ '^[0-9]+$'
        then (storage_object.metadata ->> 'size')::bigint
      else 0
    end
  ), 0)
  into stored_bytes
  from storage.objects as storage_object
  where storage_object.bucket_id = 'presentation-images'
    and storage_object.name like actor_user_id::text || '/%';

  select coalesce(sum(intent.expected_size), 0)
  into reserved_bytes
  from public.mcp_image_upload_intents as intent
  where intent.user_id = actor_user_id
    and intent.status in ('prepared', 'claimed');

  if stored_bytes + reserved_bytes + requested_size > image_quota_bytes then
    return query select
      'quota_exceeded',
      null::uuid,
      null::text,
      null::timestamptz,
      current_tokens,
      null::integer;
    return;
  end if;

  next_upload_id := extensions.gen_random_uuid();
  next_expires_at := current_time + interval '10 minutes';
  next_storage_path := actor_user_id::text || '/' || target_presentation_id::text || '/' || next_upload_id::text || '.webp';

  insert into public.mcp_image_upload_intents (
    id,
    token_hash,
    user_id,
    presentation_id,
    expected_mime_type,
    expected_size,
    storage_path,
    expires_at
  )
  values (
    next_upload_id,
    credential_hash,
    actor_user_id,
    target_presentation_id,
    requested_mime_type,
    requested_size,
    next_storage_path,
    next_expires_at
  );

  update public.mcp_image_upload_rate_limits as rate_limit
  set tokens = current_tokens - 1,
      updated_at = current_time
  where rate_limit.user_id = actor_user_id;

  return query select
    'prepared',
    next_upload_id,
    next_storage_path,
    next_expires_at,
    current_tokens - 1,
    0;
end;
$$;

create or replace function public.mcp_claim_presentation_image_upload(
  target_upload_id uuid,
  credential_hash text
)
returns table (
  result_status text,
  upload_id uuid,
  user_id uuid,
  presentation_id uuid,
  expected_mime_type text,
  expected_size bigint,
  storage_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_upload_id uuid;
  claimed_user_id uuid;
  claimed_presentation_id uuid;
  claimed_mime_type text;
  claimed_size bigint;
  claimed_storage_path text;
begin
  update public.mcp_image_upload_intents as intent
  set status = 'claimed',
      claimed_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where intent.id = target_upload_id
    and intent.token_hash = credential_hash
    and intent.status = 'prepared'
    and intent.expires_at > clock_timestamp()
  returning
    intent.id,
    intent.user_id,
    intent.presentation_id,
    intent.expected_mime_type,
    intent.expected_size,
    intent.storage_path
  into
    claimed_upload_id,
    claimed_user_id,
    claimed_presentation_id,
    claimed_mime_type,
    claimed_size,
    claimed_storage_path;

  if claimed_upload_id is null then
    update public.mcp_image_upload_intents as intent
    set status = 'expired',
        updated_at = clock_timestamp()
    where intent.id = target_upload_id
      and intent.status = 'prepared'
      and intent.expires_at <= clock_timestamp();

    return query select
      'invalid',
      null::uuid,
      null::uuid,
      null::uuid,
      null::text,
      null::bigint,
      null::text;
    return;
  end if;

  return query select
    'claimed',
    claimed_upload_id,
    claimed_user_id,
    claimed_presentation_id,
    claimed_mime_type,
    claimed_size,
    claimed_storage_path;
end;
$$;

create or replace function public.mcp_complete_presentation_image_upload(
  target_upload_id uuid,
  stored_size bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if stored_size < 1 or stored_size > 10485760 then
    return false;
  end if;

  update public.mcp_image_upload_intents as intent
  set status = 'completed',
      actual_size = stored_size,
      completed_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where intent.id = target_upload_id
    and intent.status = 'claimed';

  return found;
end;
$$;

create or replace function public.mcp_reject_presentation_image_upload(
  target_upload_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.mcp_image_upload_intents as intent
  set status = 'rejected',
      updated_at = clock_timestamp()
  where intent.id = target_upload_id
    and intent.status in ('prepared', 'claimed');

  return found;
end;
$$;

revoke all on function public.mcp_prepare_presentation_image_upload(uuid, uuid, text, text, bigint)
from public, anon, authenticated;
revoke all on function public.mcp_claim_presentation_image_upload(uuid, text)
from public, anon, authenticated;
revoke all on function public.mcp_complete_presentation_image_upload(uuid, bigint)
from public, anon, authenticated;
revoke all on function public.mcp_reject_presentation_image_upload(uuid)
from public, anon, authenticated;

grant execute on function public.mcp_prepare_presentation_image_upload(uuid, uuid, text, text, bigint)
to service_role;
grant execute on function public.mcp_claim_presentation_image_upload(uuid, text)
to service_role;
grant execute on function public.mcp_complete_presentation_image_upload(uuid, bigint)
to service_role;
grant execute on function public.mcp_reject_presentation_image_upload(uuid)
to service_role;
