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
  now_at timestamptz := clock_timestamp();
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
      updated_at = now_at
  where intent.user_id = actor_user_id
    and intent.status = 'prepared'
    and intent.expires_at <= now_at;

  update public.mcp_image_upload_intents as intent
  set status = 'rejected',
      updated_at = now_at
  where intent.user_id = actor_user_id
    and intent.status = 'claimed'
    and intent.claimed_at < now_at - interval '15 minutes';

  delete from public.mcp_image_upload_intents as intent
  where intent.user_id = actor_user_id
    and (
      (intent.status in ('expired', 'rejected') and intent.updated_at < now_at - interval '24 hours')
      or (intent.status = 'completed' and intent.completed_at < now_at - interval '30 days')
    );

  insert into public.mcp_image_upload_rate_limits (
    user_id,
    tokens,
    last_refilled_at,
    updated_at
  )
  values (actor_user_id, bucket_capacity, now_at, now_at)
  on conflict (user_id) do nothing;

  select rate_limit.tokens, rate_limit.last_refilled_at
  into current_tokens, last_refill
  from public.mcp_image_upload_rate_limits as rate_limit
  where rate_limit.user_id = actor_user_id
  for update;

  elapsed_refills := greatest(
    0,
    floor(extract(epoch from (now_at - last_refill)) / refill_seconds)::integer
  );
  if elapsed_refills > 0 then
    current_tokens := least(bucket_capacity, current_tokens + elapsed_refills);
    last_refill := last_refill + make_interval(secs => elapsed_refills * refill_seconds);
  end if;

  update public.mcp_image_upload_rate_limits as rate_limit
  set tokens = current_tokens,
      last_refilled_at = last_refill,
      updated_at = now_at
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
        ceil(refill_seconds - extract(epoch from (now_at - last_refill)))::integer
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
  next_expires_at := now_at + interval '10 minutes';
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
      updated_at = now_at
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
