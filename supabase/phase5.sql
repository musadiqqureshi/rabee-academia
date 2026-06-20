-- ===========================================================================
-- Rabee Academia — Phase 5: Real-time chat
-- Conversations, participants, messages + RLS (recursion-safe via SECURITY
-- DEFINER helpers) + Realtime publication. Idempotent.
-- ===========================================================================

create extension if not exists "uuid-ossp";

create table if not exists public.conversations (
  id         uuid primary key default uuid_generate_v4(),
  type       text not null default 'direct',   -- 'direct' | 'group'
  title      text,
  batch_id   uuid references public.batches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id),
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_participants_user on public.conversation_participants(user_id);

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER → bypass RLS, avoid recursive policies)
-- ---------------------------------------------------------------------------
create or replace function public.is_conversation_member(cid uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = cid and user_id = auth.uid()
  );
$$;

create or replace function public.get_or_create_direct(other uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid; me uuid := auth.uid();
begin
  if me is null then raise exception 'auth required'; end if;
  select c.id into cid
  from public.conversations c
  join public.conversation_participants p1 on p1.conversation_id = c.id and p1.user_id = me
  join public.conversation_participants p2 on p2.conversation_id = c.id and p2.user_id = other
  where c.type = 'direct'
  limit 1;
  if cid is not null then return cid; end if;
  insert into public.conversations(type) values ('direct') returning id into cid;
  insert into public.conversation_participants(conversation_id, user_id) values (cid, me), (cid, other);
  return cid;
end; $$;

-- Group chat for a batch (teacher + approved students).
create or replace function public.get_or_create_batch_group(batch uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid; me uuid := auth.uid();
begin
  if me is null then raise exception 'auth required'; end if;
  select id into cid from public.conversations where type = 'group' and batch_id = batch limit 1;
  if cid is null then
    insert into public.conversations(type, batch_id, title)
    values ('group', batch, (select s.name from public.batches b join public.subjects s on s.id = b.subject_id where b.id = batch))
    returning id into cid;
  end if;
  -- Ensure teacher + approved students are participants.
  insert into public.conversation_participants(conversation_id, user_id)
  select cid, b.teacher_id from public.batches b where b.id = batch
  on conflict do nothing;
  insert into public.conversation_participants(conversation_id, user_id)
  select cid, e.student_id from public.enrollments e where e.batch_id = batch and e.status = 'approved'
  on conflict do nothing;
  return cid;
end; $$;

-- Allowed chat contacts for the current user.
create or replace function public.my_chat_contacts()
returns table(id uuid, full_name text, email text, role public.user_role)
language sql security definer set search_path = public stable as $$
  with me as (select role from public.profiles where id = auth.uid())
  select p.id, p.full_name, p.email, p.role
  from public.profiles p, me
  where p.id <> auth.uid() and (
    (me.role in ('admin','super_admin'))
    or (me.role = 'teacher' and (
         p.role in ('admin','super_admin')
         or exists (select 1 from public.enrollments e join public.batches b on b.id = e.batch_id
                    where b.teacher_id = auth.uid() and e.student_id = p.id and e.status = 'approved')
       ))
    or (me.role = 'student' and (
         p.role in ('admin','super_admin')
         or exists (select 1 from public.enrollments e join public.batches b on b.id = e.batch_id
                    where e.student_id = auth.uid() and b.teacher_id = p.id and e.status = 'approved')
       ))
  )
  order by p.role, p.full_name;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;

drop policy if exists "conv_member_select"    on public.conversations;
drop policy if exists "conv_auth_insert"      on public.conversations;
drop policy if exists "part_member_select"    on public.conversation_participants;
drop policy if exists "part_auth_insert"      on public.conversation_participants;
drop policy if exists "msg_member_select"     on public.messages;
drop policy if exists "msg_member_insert"     on public.messages;

create policy "conv_member_select" on public.conversations
  for select to authenticated using (public.is_conversation_member(id));
create policy "conv_auth_insert" on public.conversations
  for insert to authenticated with check (true);

create policy "part_member_select" on public.conversation_participants
  for select to authenticated using (public.is_conversation_member(conversation_id));
create policy "part_auth_insert" on public.conversation_participants
  for insert to authenticated with check (true);

create policy "msg_member_select" on public.messages
  for select to authenticated using (public.is_conversation_member(conversation_id));
create policy "msg_member_insert" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

-- Realtime
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; when others then null; end $$;
