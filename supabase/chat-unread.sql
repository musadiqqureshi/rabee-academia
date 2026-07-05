-- =============================================================================
-- Per-conversation unread tracking so the chat sidebar can show a red badge on
-- whoever messaged you (and how many). Adds a last_read_at marker per
-- participant + two RPCs. Run in the Supabase SQL editor (idempotent).
-- =============================================================================

alter table public.conversation_participants
  add column if not exists last_read_at timestamptz not null default now();

-- Unread count per conversation for the current user, plus who the other
-- participant is (direct) or which batch it belongs to (group), so the client
-- can map the badge to a contact / class group.
create or replace function public.chat_unread()
returns table(conversation_id uuid, other_id uuid, batch_id uuid, unread int, last_at timestamptz)
language sql security definer set search_path = public stable as $$
  select
    c.id,
    (select p2.user_id from public.conversation_participants p2
       where p2.conversation_id = c.id and p2.user_id <> auth.uid()
       limit 1) as other_id,
    c.batch_id,
    (select count(*) from public.messages m
       where m.conversation_id = c.id
         and m.sender_id <> auth.uid()
         and m.created_at > me.last_read_at)::int as unread,
    (select max(m.created_at) from public.messages m where m.conversation_id = c.id) as last_at
  from public.conversations c
  join public.conversation_participants me
    on me.conversation_id = c.id and me.user_id = auth.uid();
$$;
grant execute on function public.chat_unread() to authenticated;

-- Mark a conversation as read up to now for the current user.
create or replace function public.mark_conversation_read(cid uuid)
returns void language sql security definer set search_path = public as $$
  update public.conversation_participants
    set last_read_at = now()
    where conversation_id = cid and user_id = auth.uid();
$$;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
