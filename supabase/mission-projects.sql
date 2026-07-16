-- =============================================================
-- IM Flow · 선교 버전에 "프로젝트" 층 추가 (기존 데이터 유지, 추가만 함)
-- 이미 mission-schema.sql 을 실행한 프로젝트에서 이 파일을 추가로 실행하세요.
-- (mf_is_director() 함수가 이미 있어야 합니다)
-- =============================================================

-- 1) 프로젝트 테이블
create table if not exists public.mf_projects (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  description text        not null default '',
  deadline    date,
  status      text        not null default 'active' check (status in ('active','onhold','done')),
  created_at  timestamptz not null default now()
);
create index if not exists mf_projects_owner_idx on public.mf_projects(owner_id);

-- 2) 할일에 프로젝트 연결 컬럼 추가
alter table public.mf_tasks
  add column if not exists project_id uuid references public.mf_projects(id) on delete set null;

-- 3) RLS (본인 프로젝트만, 디렉터는 전체 조회)
alter table public.mf_projects enable row level security;

drop policy if exists "mf_projects_select" on public.mf_projects;
create policy "mf_projects_select" on public.mf_projects for select
  using (auth.uid() = owner_id or public.mf_is_director());

drop policy if exists "mf_projects_insert" on public.mf_projects;
create policy "mf_projects_insert" on public.mf_projects for insert
  with check (auth.uid() = owner_id);

drop policy if exists "mf_projects_update" on public.mf_projects;
create policy "mf_projects_update" on public.mf_projects for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "mf_projects_delete" on public.mf_projects;
create policy "mf_projects_delete" on public.mf_projects for delete
  using (auth.uid() = owner_id);
