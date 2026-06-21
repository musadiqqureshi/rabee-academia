-- ===========================================================================
-- Rabee Academia — Phase 14: Rabee's AI Paper Maker (SaaS usage limits)
-- Tracks daily paper-generation usage per user with a once-a-day free limit
-- and an optional Pro window (pro_until). All writes go through a SECURITY
-- DEFINER function so clients can't tamper with their own counts. Idempotent.
-- ===========================================================================

create table if not exists public.ai_paper_usage (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  used_date  date not null default current_date,
  count      int  not null default 0,
  pro_until  timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.ai_paper_usage enable row level security;

drop policy if exists "ai_usage_self_read" on public.ai_paper_usage;
create policy "ai_usage_self_read" on public.ai_paper_usage
  for select to authenticated using (user_id = auth.uid());

-- Atomically check + increment the caller's daily quota. Returns JSON:
--   { allowed: bool, reason?: 'auth'|'limit', count: int, pro: bool, limit: int }
create or replace function public.consume_paper_quota(daily_limit int default 1)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me     uuid := auth.uid();
  rec    public.ai_paper_usage;
  is_pro boolean;
begin
  if me is null then
    return jsonb_build_object('allowed', false, 'reason', 'auth');
  end if;

  insert into public.ai_paper_usage(user_id, used_date, count)
    values (me, current_date, 0)
    on conflict (user_id) do nothing;

  select * into rec from public.ai_paper_usage where user_id = me for update;

  -- New day → reset the counter.
  if rec.used_date < current_date then
    rec.count := 0;
    update public.ai_paper_usage set used_date = current_date, count = 0 where user_id = me;
  end if;

  is_pro := rec.pro_until is not null and rec.pro_until > now();

  if not is_pro and rec.count >= daily_limit then
    return jsonb_build_object('allowed', false, 'reason', 'limit', 'count', rec.count, 'pro', false, 'limit', daily_limit);
  end if;

  update public.ai_paper_usage set count = rec.count + 1, updated_at = now() where user_id = me;
  return jsonb_build_object('allowed', true, 'count', rec.count + 1, 'pro', is_pro, 'limit', daily_limit);
end; $$;

grant execute on function public.consume_paper_quota(int) to authenticated;

-- Admin helper: grant/extend Pro for a user by email (e.g. after a manual
-- 3000 PKR/month payment). Only admins may call it.
create or replace function public.set_paper_pro(target_email text, until timestamptz)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')) then
    raise exception 'not authorized';
  end if;
  select id into uid from public.profiles where lower(email) = lower(target_email);
  if uid is null then raise exception 'user not found'; end if;
  insert into public.ai_paper_usage(user_id, used_date, count, pro_until)
    values (uid, current_date, 0, until)
    on conflict (user_id) do update set pro_until = excluded.pro_until, updated_at = now();
end; $$;

grant execute on function public.set_paper_pro(text, timestamptz) to authenticated;
