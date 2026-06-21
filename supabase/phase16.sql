-- ===========================================================================
-- Rabee Academia — Phase 16: Generic per-tool daily quota for Rabee's AI tools
-- Each AI tool (essay grader, lesson plan, notes, planner, quiz, paper) gets
-- its own free-once-a-day counter per user. Pro users (ai_paper_usage.pro_until
-- in the future) bypass every tool. All writes go through a SECURITY DEFINER
-- function so clients can't tamper with counts. Idempotent.
-- ===========================================================================

create table if not exists public.ai_tool_usage (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tool_key   text not null,
  used_date  date not null default current_date,
  count      int  not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_key)
);

alter table public.ai_tool_usage enable row level security;

drop policy if exists "ai_tool_usage_self_read" on public.ai_tool_usage;
create policy "ai_tool_usage_self_read" on public.ai_tool_usage
  for select to authenticated using (user_id = auth.uid());

-- Atomically check + increment the caller's daily quota for a given tool.
-- Returns: { allowed: bool, reason?: 'auth'|'limit', count: int, pro: bool, limit: int }
create or replace function public.consume_tool_quota(tool text, daily_limit int default 1)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me     uuid := auth.uid();
  rec    public.ai_tool_usage;
  is_pro boolean := false;
begin
  if me is null then
    return jsonb_build_object('allowed', false, 'reason', 'auth');
  end if;

  -- Pro window is stored on ai_paper_usage and applies to all tools.
  select (pro_until is not null and pro_until > now()) into is_pro
    from public.ai_paper_usage where user_id = me;
  is_pro := coalesce(is_pro, false);

  insert into public.ai_tool_usage(user_id, tool_key, used_date, count)
    values (me, tool, current_date, 0)
    on conflict (user_id, tool_key) do nothing;

  select * into rec from public.ai_tool_usage where user_id = me and tool_key = tool for update;

  if rec.used_date < current_date then
    rec.count := 0;
    update public.ai_tool_usage set used_date = current_date, count = 0 where user_id = me and tool_key = tool;
  end if;

  if not is_pro and rec.count >= daily_limit then
    return jsonb_build_object('allowed', false, 'reason', 'limit', 'count', rec.count, 'pro', false, 'limit', daily_limit);
  end if;

  update public.ai_tool_usage set count = rec.count + 1, updated_at = now() where user_id = me and tool_key = tool;
  return jsonb_build_object('allowed', true, 'count', rec.count + 1, 'pro', is_pro, 'limit', daily_limit);
end; $$;

grant execute on function public.consume_tool_quota(text, int) to authenticated;
