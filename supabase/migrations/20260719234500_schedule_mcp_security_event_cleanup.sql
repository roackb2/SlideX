create extension if not exists pg_cron;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'purge-expired-mcp-oauth-security-events';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'purge-expired-mcp-oauth-security-events',
    '17 * * * *',
    $cleanup$delete from public.mcp_oauth_security_events where expires_at <= statement_timestamp()$cleanup$
  );
end;
$$;
