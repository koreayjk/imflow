-- =============================================================
-- IM Flow · Supabase 스키마
--
-- 이 Supabase 프로젝트에는 다른 앱이 함께 있으므로, 충돌을 피하려고
-- 모든 객체에 `imflow_` 접두사를 붙였습니다.
--
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣고 실행하세요.
-- (기존 다른 앱의 테이블에는 영향을 주지 않습니다.)
-- =============================================================

-- 안전하게 재실행할 수 있도록 IM Flow 객체만 정리 (개발 단계용)
drop table if exists public.imflow_tasks cascade;
drop table if exists public.imflow_projects cascade;

-- -------------------------------------------------------------
-- 1) 프로젝트 테이블
--    status: 준비(preparing) → 진행(in_progress) → 검토(review) → 완료(done)
-- -------------------------------------------------------------
create table public.imflow_projects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  name        text        not null check (char_length(name) between 1 and 100),
  description text,
  deadline    date,
  status      text        not null default 'preparing'
                          check (status in ('preparing', 'in_progress', 'review', 'done')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index imflow_projects_user_id_idx    on public.imflow_projects (user_id);
create index imflow_projects_created_at_idx on public.imflow_projects (created_at desc);

-- -------------------------------------------------------------
-- 2) 할일(태스크) 테이블 — 각 프로젝트의 단계별 할일
-- -------------------------------------------------------------
create table public.imflow_tasks (
  id           uuid        primary key default gen_random_uuid(),
  project_id   uuid        not null references public.imflow_projects (id) on delete cascade,
  stage        text        not null default 'preparing'
                           check (stage in ('preparing', 'in_progress', 'review', 'done')),
  title        text        not null check (char_length(title) between 1 and 200),
  is_completed boolean     not null default false,
  created_at   timestamptz not null default now()
);

create index imflow_tasks_project_id_idx on public.imflow_tasks (project_id);
create index imflow_tasks_stage_idx      on public.imflow_tasks (project_id, stage);

-- -------------------------------------------------------------
-- 3) updated_at 자동 갱신 트리거 (이름도 imflow_ 로 격리)
-- -------------------------------------------------------------
create or replace function public.imflow_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger imflow_projects_set_updated_at
  before update on public.imflow_projects
  for each row execute function public.imflow_set_updated_at();

-- -------------------------------------------------------------
-- 4) Row Level Security (RLS)
--    사용자는 자신의 데이터만 읽고/쓸 수 있습니다.
-- -------------------------------------------------------------
alter table public.imflow_projects enable row level security;
alter table public.imflow_tasks    enable row level security;

-- 프로젝트: 본인 소유만 접근
create policy "imflow 프로젝트 조회 - 본인만"
  on public.imflow_projects for select
  using (auth.uid() = user_id);

create policy "imflow 프로젝트 생성 - 본인만"
  on public.imflow_projects for insert
  with check (auth.uid() = user_id);

create policy "imflow 프로젝트 수정 - 본인만"
  on public.imflow_projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "imflow 프로젝트 삭제 - 본인만"
  on public.imflow_projects for delete
  using (auth.uid() = user_id);

-- 할일: 소속 프로젝트가 본인 소유일 때만 접근
create policy "imflow 할일 조회 - 본인 프로젝트만"
  on public.imflow_tasks for select
  using (
    exists (
      select 1 from public.imflow_projects p
      where p.id = imflow_tasks.project_id and p.user_id = auth.uid()
    )
  );

create policy "imflow 할일 생성 - 본인 프로젝트만"
  on public.imflow_tasks for insert
  with check (
    exists (
      select 1 from public.imflow_projects p
      where p.id = imflow_tasks.project_id and p.user_id = auth.uid()
    )
  );

create policy "imflow 할일 수정 - 본인 프로젝트만"
  on public.imflow_tasks for update
  using (
    exists (
      select 1 from public.imflow_projects p
      where p.id = imflow_tasks.project_id and p.user_id = auth.uid()
    )
  );

create policy "imflow 할일 삭제 - 본인 프로젝트만"
  on public.imflow_tasks for delete
  using (
    exists (
      select 1 from public.imflow_projects p
      where p.id = imflow_tasks.project_id and p.user_id = auth.uid()
    )
  );
