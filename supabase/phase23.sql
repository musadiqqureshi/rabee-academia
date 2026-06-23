-- ===========================================================================
-- Rabee Academia — Phase 23: admins also get emailed on student/teacher messages
-- Extends notify_on_message so every message from a student or teacher also
-- creates an admin notification (the notifications webhook then emails admins).
-- Idempotent.
-- ===========================================================================

create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare sender_name text; sender_role public.user_role;
begin
  select coalesce(full_name, email, 'Someone'), role
    into sender_name, sender_role
    from public.profiles where id = NEW.sender_id;

  -- 1) Notify the other participant of a DIRECT message (unchanged behaviour).
  insert into public.notifications (user_id, title, body)
  select p.user_id,
         'New message from ' || sender_name,
         left(NEW.body, 140)
  from public.conversation_participants p
  join public.conversations c on c.id = p.conversation_id
  where p.conversation_id = NEW.conversation_id
    and p.user_id <> NEW.sender_id
    and c.type = 'direct';

  -- 2) Notify admins of EVERY message from a student/teacher (so they get the
  --    email), skipping admins already in the conversation to avoid duplicates.
  if sender_role in ('student', 'teacher') then
    insert into public.notifications (user_id, title, body)
    select a.id,
           'New message from ' || sender_name || ' (' || sender_role || ')',
           left(NEW.body, 140)
    from public.profiles a
    where a.role in ('admin', 'super_admin')
      and a.id <> NEW.sender_id
      and not exists (
        select 1 from public.conversation_participants p
        where p.conversation_id = NEW.conversation_id and p.user_id = a.id
      );
  end if;

  return NEW;
end; $$;

drop trigger if exists trg_notify_on_message on public.messages;
create trigger trg_notify_on_message
  after insert on public.messages
  for each row execute function public.notify_on_message();
