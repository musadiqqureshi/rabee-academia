-- =============================================================================
-- Reliable chat history loader. The messages RLS select policy can silently
-- return 0 rows (empty history). This SECURITY DEFINER RPC returns a
-- conversation's messages as long as the caller is a participant.
-- Run in the Supabase SQL editor (idempotent).
-- =============================================================================

create or replace function public.chat_history(cid uuid)
returns setof public.messages
language sql security definer set search_path = public stable as $$
  select m.*
  from public.messages m
  where m.conversation_id = cid
    and exists (
      select 1 from public.conversation_participants p
      where p.conversation_id = cid and p.user_id = auth.uid()
    )
  order by m.created_at asc;
$$;

grant execute on function public.chat_history(uuid) to authenticated;
