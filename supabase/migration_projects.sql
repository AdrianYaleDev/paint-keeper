-- Projects: personal groups of paints (e.g. an army paint scheme), synced per user.
-- Run once in the Supabase SQL editor.
begin;

create table if not exists public.user_projects (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  project jsonb not null,
  updated_at timestamptz not null,
  primary key (user_id, project_id),
  check (jsonb_typeof(project) = 'object' and project ->> 'id' = project_id)
);

alter table public.user_projects enable row level security;
revoke all on public.user_projects from anon, authenticated;
grant select, insert, update on public.user_projects to authenticated;

drop policy if exists "Users can read their own projects" on public.user_projects;
drop policy if exists "Users can add their own projects" on public.user_projects;
drop policy if exists "Users can update their own projects" on public.user_projects;
create policy "Users can read their own projects" on public.user_projects
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own projects" on public.user_projects
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own projects" on public.user_projects
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
