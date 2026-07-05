-- =============================================================================
-- Fix chat contacts: a teacher & student should be able to message each other
-- when the student is allotted to the teacher DIRECTLY (enrollments.teacher_id),
-- not only through a batch. Run in the Supabase SQL editor (idempotent).
-- =============================================================================

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
         or exists (
           select 1 from public.enrollments e
           where e.student_id = p.id and e.status = 'approved'
             and (e.teacher_id = auth.uid()
                  or exists (select 1 from public.batches b where b.id = e.batch_id and b.teacher_id = auth.uid()))
         )
       ))
    or (me.role = 'student' and (
         p.role in ('admin','super_admin')
         or exists (
           select 1 from public.enrollments e
           where e.student_id = auth.uid() and e.status = 'approved'
             and (e.teacher_id = p.id
                  or exists (select 1 from public.batches b where b.id = e.batch_id and b.teacher_id = p.id))
         )
       ))
  )
  order by p.role, p.full_name;
$$;
