import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // 개발 중 환경변수 누락을 빠르게 알아채기 위한 경고
  // eslint-disable-next-line no-console
  console.warn(
    '[IM Flow] Supabase 환경변수가 없습니다. 프로젝트 루트에 .env.local 을 만들고\n' +
      'REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY 를 설정한 뒤 다시 실행하세요.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

// 이 Supabase 프로젝트에는 다른 앱이 함께 있어서, 충돌을 피하려고
// 모든 테이블에 `imflow_` 접두사를 사용합니다. (supabase/schema.sql 과 일치)
export const TABLES = {
  projects: 'imflow_projects',
  tasks: 'imflow_tasks',
} as const;
