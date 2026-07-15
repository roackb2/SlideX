-- Trigger functions do not need to be callable through the Data API. Keep
-- execution with the function owner so the table trigger can continue to run.
revoke all on function public.broadcast_workspace_presentation_changes() from public;
revoke execute on function public.broadcast_workspace_presentation_changes() from anon, authenticated;

-- The project uses private-only Realtime channels. Authorize the existing
-- slide-comment Postgres Changes topic only when the signed-in user owns the
-- presentation encoded in that topic. No INSERT policy is provided, so clients
-- still cannot send Broadcast messages.
drop policy if exists "slide_comments_receive_own_realtime"
on realtime.messages;

create policy "slide_comments_receive_own_realtime"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.presentations
    where presentations.user_id = (select auth.uid())
      and (select realtime.topic()) = 'slide-comments:' || presentations.id::text
  )
);
