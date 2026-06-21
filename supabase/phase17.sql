-- ===========================================================================
-- Rabee Academia — Phase 17: Word-based daily quota (for the AI Humanizer)
-- The Humanizer is limited by WORDS processed per day (free = 2000), not by a
-- count of generations. Reuses ai_tool_usage.count to store words for the
-- 'humanizer' tool_key. Pro users are unlimited. Idempotent.
-- ===========================================================================

create or replace function public.consume_words_quota(tool text, words int, daily_limit int default 2000)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me     uuid := auth.uid();
  rec    public.ai_tool_usage;
  is_pro boolean := false;
  used   int;
begin
  if me is null then return jsonb_build_object('allowed', false, 'reason', 'auth'); end if;
  if words is null or words < 0 then words := 0; end if;

  select (pro_until is not null and pro_until > now()) into is_pro from public.ai_paper_usage where user_id = me;
  is_pro := coalesce(is_pro, false);

  insert into public.ai_tool_usage(user_id, tool_key, used_date, count)
    values (me, tool, current_date, 0)
    on conflict (user_id, tool_key) do nothing;

  select * into rec from public.ai_tool_usage where user_id = me and tool_key = tool for update;

  if rec.used_date < current_date then
    rec.count := 0;
    update public.ai_tool_usage set used_date = current_date, count = 0 where user_id = me and tool_key = tool;
  end if;
  used := rec.count;

  if not is_pro and used + words > daily_limit then
    return jsonb_build_object('allowed', false, 'reason', 'limit', 'used', used,
      'remaining', greatest(daily_limit - used, 0), 'limit', daily_limit, 'pro', false);
  end if;

  update public.ai_tool_usage set count = used + words, updated_at = now() where user_id = me and tool_key = tool;
  return jsonb_build_object('allowed', true, 'used', used + words,
    'remaining', case when is_pro then null else greatest(daily_limit - (used + words), 0) end,
    'limit', daily_limit, 'pro', is_pro);
end; $$;

grant execute on function public.consume_words_quota(text, int, int) to authenticated;
