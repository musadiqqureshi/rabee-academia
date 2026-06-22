-- ===========================================================================
-- Rabee Academia — Phase 19: Notify on new direct message
-- When someone sends a DIRECT message, create an in-app notification for the
-- other participant. The notifications INSERT webhook then emails them.
-- Limited to 1:1 (direct) conversations to avoid emailing whole group classes
-- on every message. SECURITY DEFINER so it works for client-sent messages.
-- Idempotent.
-- ===========================================================================

create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare sender_name text;
begin
  select coalesce(full_name, email, 'Someone') into sender_name
    from public.profiles where id = NEW.sender_id;

  insert into public.notifications (user_id, title, body)
  select p.user_id,
         'New message from ' || sender_name,
         left(NEW.body, 140)
  from public.conversation_participants p
  join public.conversations c on c.id = p.conversation_id
  where p.conversation_id = NEW.conversation_id
    and p.user_id <> NEW.sender_id
    and c.type = 'direct';

  return NEW;
end; $$;

drop trigger if exists trg_notify_on_message on public.messages;
create trigger trg_notify_on_message
  after insert on public.messages
  for each row execute function public.notify_on_message();
