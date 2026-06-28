# IM Flow

한국 소상공인을 위한 프로젝트 관리 SaaS. React + TypeScript + Supabase 로 만들었습니다.

## 주요 기능 (MVP)

- 📧 이메일 로그인 / 회원가입 (Supabase Auth)
- 📁 프로젝트 생성 (이름 · 설명 · 마감일)
- 🔄 프로젝트 단계 관리 (준비 → 진행 → 검토 → 완료)
- ✅ 각 단계별 할일 추가 / 완료 / 다음 단계 이동 / 삭제
- 📊 대시보드에서 전체 프로젝트 진행률 한눈에 보기
- 📱 모바일 퍼스트, 한국어 UI

## 기술 스택

- React 19 + TypeScript (Create React App)
- React Router v7
- Supabase (Auth + PostgreSQL + RLS)
- Tailwind CSS v3
- lucide-react (아이콘)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

> 참고: 이 프로젝트는 CRA 와 호환되는 **Tailwind CSS v3** 를 사용합니다.
> (`tailwindcss@3`, `postcss`, `autoprefixer` — `package.json` 에 이미 반영되어 있습니다.)

### 2. Supabase 설정

1. [supabase.com](https://supabase.com) 에서 프로젝트를 생성합니다.
2. 대시보드 > **SQL Editor** 에 [`supabase/schema.sql`](./supabase/schema.sql) 내용을 붙여넣고 실행합니다.
   (테이블 · 인덱스 · RLS 정책이 모두 생성됩니다.)
3. **Project Settings > API** 에서 `Project URL` 과 `anon public` 키를 복사합니다.

### 3. 환경변수

```bash
cp .env.example .env.local
```

`.env.local` 을 열어 값을 채웁니다:

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. 실행

```bash
npm start
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 폴더 구조

```
src/
├─ components/        # 재사용 UI
│  ├─ AuthForm.tsx        로그인/회원가입 공용 폼
│  ├─ Layout.tsx          상단바 + 본문 래퍼
│  ├─ ProtectedRoute.tsx  인증 가드
│  ├─ ProjectCard.tsx     대시보드 프로젝트 카드
│  ├─ NewProjectModal.tsx 새 프로젝트 모달
│  ├─ StageColumn.tsx     단계별 할일 컬럼
│  ├─ StageBadge.tsx      단계 배지
│  ├─ TaskItem.tsx        할일 한 줄
│  ├─ ProgressBar.tsx     진행률 바
│  └─ Spinner.tsx         로딩 표시
├─ contexts/
│  └─ AuthContext.tsx     세션/로그인/로그아웃 상태
├─ lib/
│  ├─ supabase.ts         Supabase 클라이언트
│  ├─ constants.ts        단계(STAGES) 정의
│  └─ date.ts             날짜 · D-Day 헬퍼
├─ pages/
│  ├─ LoginPage.tsx
│  ├─ SignupPage.tsx
│  ├─ DashboardPage.tsx
│  └─ ProjectDetailPage.tsx
├─ types/
│  └─ index.ts            Project / Task 타입
├─ App.tsx               라우팅
└─ index.tsx             진입점

supabase/
└─ schema.sql            DB 스키마 + RLS
```

## 데이터 모델

이 Supabase 프로젝트에는 다른 앱이 함께 있어서, **충돌을 피하려고 모든 테이블에 `imflow_` 접두사**를 사용합니다.
(코드에서는 `src/lib/supabase.ts` 의 `TABLES` 상수 한 곳에서 이름을 관리합니다.)

| 테이블             | 설명                                                          |
| ------------------ | ------------------------------------------------------------- |
| `imflow_projects`  | 프로젝트. `status` 로 현재 단계 관리, `user_id` 로 소유자 구분 |
| `imflow_tasks`     | 할일. `project_id` 로 프로젝트에 속하고 `stage` 로 단계 구분   |

모든 테이블에 RLS 가 적용되어 **각 사용자는 자신의 데이터만** 조회·수정할 수 있습니다.
