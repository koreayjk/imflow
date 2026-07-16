-- =============================================================
-- IM Flow · 공유 프로젝트 + 할일 담당자 (③ 회사관리 기반)
-- mission-schema.sql, mission-projects.sql 을 먼저 실행한 뒤 이 파일을 실행하세요.
-- 기존 데이터는 유지됩니다.
-- =============================================================

-- 1) 프로필: 로그인한 모두가 이름을 읽을 수 있게 (담당자 선택/표시용)
drop policy if exists "mf_profiles_select" on public.mf_profiles;
create policy "mf_profiles_select" on public.mf_profiles for select
  using (auth.uid() is not null);

-- 2) 프로젝트: 팀 공유 (로그인한 누구나 조회), 수정/삭제는 소유자·디렉터
drop policy if exists "mf_projects_select" on public.mf_projects;
create policy "mf_projects_select" on public.mf_projects for select
  using (auth.uid() is not null);
drop policy if exists "mf_projects_update" on public.mf_projects;
create policy "mf_projects_update" on public.mf_projects for update
  using (auth.uid() = owner_id or public.mf_is_director())
  with check (auth.uid() = owner_id or public.mf_is_director());
drop policy if exists "mf_projects_delete" on public.mf_projects;
create policy "mf_projects_delete" on public.mf_projects for delete
  using (auth.uid() = owner_id or public.mf_is_director());

-- 3) 할일에 담당자(assignee_id) 추가 + 기존 데이터는 작성자를 담당자로
alter table public.mf_tasks add column if not exists assignee_id uuid references auth.users(id);
update public.mf_tasks set assignee_id = user_id where assignee_id is null;
create index if not exists mf_tasks_assignee_idx on public.mf_tasks(assignee_id);

-- 4) 할일 RLS 재정의
--    조회: 담당자 / 작성자 / 프로젝트에 속한 할일(공유) / 디렉터
drop policy if exists "mf_tasks_select" on public.mf_tasks;
create policy "mf_tasks_select" on public.mf_tasks for select
  using (assignee_id = auth.uid() or user_id = auth.uid() or project_id is not null or public.mf_is_director());
--    생성: 작성자는 본인 (담당자는 자유롭게 지정)
drop policy if exists "mf_tasks_insert" on public.mf_tasks;
create policy "mf_tasks_insert" on public.mf_tasks for insert
  with check (user_id = auth.uid());
--    수정: 담당자 / 작성자 / 디렉터
drop policy if exists "mf_tasks_update" on public.mf_tasks;
create policy "mf_tasks_update" on public.mf_tasks for update
  using (assignee_id = auth.uid() or user_id = auth.uid() or public.mf_is_director())
  with check (assignee_id = auth.uid() or user_id = auth.uid() or public.mf_is_director());
--    삭제: 작성자 / 디렉터
drop policy if exists "mf_tasks_delete" on public.mf_tasks;
create policy "mf_tasks_delete" on public.mf_tasks for delete
  using (user_id = auth.uid() or public.mf_is_director());
