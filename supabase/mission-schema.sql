-- =============================================================
-- IM Flow · 선교 버전 (멀티유저) 스키마
-- 선교사는 본인 할일만, 디렉터는 전체를 열람.
-- 다른 앱과 겹치지 않게 접두사 mf_ 사용.
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.
-- =============================================================

drop table if exists public.mf_tasks cascade;
drop table if exists public.mf_profiles cascade;
drop function if exists public.mf_is_director cascade;
drop function if exists public.mf_set_updated_at cascade;

-- -------------------------------------------------------------
-- 1) 프로필 (사용자 + 역할 + 지부)
-- -------------------------------------------------------------
create table public.mf_profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  name       text        not null default '',
  branch     text        not null default '',        -- 지부 (예: 필리핀, 한국)
  role       text        not null default 'missionary'
                         check (role in ('missionary','director')),
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2) 할일
-- -------------------------------------------------------------
create table public.mf_tasks (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  title      text        not null,
  horizon    text        not null default 'today'
                         check (horizon in ('today','week','month','someday')),
  category   text        not null default '',         -- 업무 대분류
  area       text        not null default '',         -- 세부영역
  priority   text        not null default 'none' check (priority in ('none','important','urgent')),
  recur      text        not null default 'none' check (recur in ('none','daily','weekly','monthly')),
  due        date,
  done       boolean     not null default false,
  done_date  date,
  carry      int         not null default 0,          -- 밀린 일수
  note       text        not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index mf_tasks_user_idx on public.mf_tasks(user_id);

-- -------------------------------------------------------------
-- 3) 디렉터 판별 함수 (RLS 재귀 방지용, security definer)
-- -------------------------------------------------------------
create or replace function public.mf_is_director()
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.mf_profiles p where p.id = auth.uid() and p.role = 'director');
$$;

-- updated_at 트리거
create or replace function public.mf_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger mf_tasks_updated before update on public.mf_tasks
  for each row execute function public.mf_set_updated_at();

-- -------------------------------------------------------------
-- 4) RLS
-- -------------------------------------------------------------
alter table public.mf_profiles enable row level security;
alter table public.mf_tasks    enable row level security;

-- 프로필: 본인 또는 디렉터는 조회, 본인만 생성/수정
create policy "mf_profiles_select" on public.mf_profiles for select
  using (auth.uid() = id or public.mf_is_director());
create policy "mf_profiles_insert" on public.mf_profiles for insert
  with check (auth.uid() = id);
create policy "mf_profiles_update" on public.mf_profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- 할일: 본인은 모두 가능, 디렉터는 전체 조회
create policy "mf_tasks_select" on public.mf_tasks for select
  using (auth.uid() = user_id or public.mf_is_director());
create policy "mf_tasks_insert" on public.mf_tasks for insert
  with check (auth.uid() = user_id);
create policy "mf_tasks_update" on public.mf_tasks for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mf_tasks_delete" on public.mf_tasks for delete
  using (auth.uid() = user_id);

-- =============================================================
-- 참고: 특정 사용자를 '디렉터'로 지정하려면 (그 사람이 먼저 가입한 뒤)
--   update public.mf_profiles set role='director'
--     where id = (select id from auth.users where email = '디렉터이메일@example.com');
-- =============================================================
