-- ===========================================================================
-- Rabee Academia — Phase 15: Pro purchase flow (bank transfer + admin approval)
-- Users submit a Pro request with a payment receipt; an admin approves it,
-- which extends their pro_until window in ai_paper_usage. Mirrors the
-- enrolment verification flow. Idempotent.
-- ===========================================================================

create extension if not exists "uuid-ossp";

create table if not exists public.ai_pro_requests (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  months      int  not null default 1,
  amount_pkr  int  not null default 3000,
  receipt_url text,
  status      public.enrollment_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_pro_requests_user on public.ai_pro_requests(user_id, created_at desc);

alter table public.ai_pro_requests enable row level security;

drop policy if exists "pro_req_self_insert" on public.ai_pro_requests;
drop policy if exists "pro_req_read"        on public.ai_pro_requests;
drop policy if exists "pro_req_staff_update" on public.ai_pro_requests;

create policy "pro_req_self_insert" on public.ai_pro_requests
  for insert to authenticated with check (user_id = auth.uid());

create policy "pro_req_read" on public.ai_pro_requests
  for select to authenticated using (user_id = auth.uid() or public.is_admin_or_super());

-- Lets the submitter attach the receipt URL after upload; staff can edit too.
create policy "pro_req_staff_update" on public.ai_pro_requests
  for update to authenticated using (user_id = auth.uid() or public.is_admin_or_super());

-- Approve a request: mark approved and extend the user's Pro window by `months`
-- from the later of now or their current expiry. Admin only.
create or replace function public.approve_pro_request(req_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.ai_pro_requests; base timestamptz;
begin
  if not public.is_admin_or_super() then raise exception 'not authorized'; end if;
  select * into r from public.ai_pro_requests where id = req_id;
  if r.id is null then raise exception 'request not found'; end if;

  insert into public.ai_paper_usage(user_id, used_date, count) values (r.user_id, current_date, 0)
    on conflict (user_id) do nothing;

  select greatest(coalesce(pro_until, now()), now()) into base from public.ai_paper_usage where user_id = r.user_id;
  update public.ai_paper_usage
    set pro_until = base + (r.months || ' months')::interval, updated_at = now()
    where user_id = r.user_id;

  update public.ai_pro_requests
    set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
    where id = req_id;
end; $$;

create or replace function public.reject_pro_request(req_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin_or_super() then raise exception 'not authorized'; end if;
  update public.ai_pro_requests
    set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
    where id = req_id;
end; $$;

grant execute on function public.approve_pro_request(uuid) to authenticated;
grant execute on function public.reject_pro_request(uuid)  to authenticated;
