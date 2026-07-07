// IM Flow 도메인 타입 정의

export type StageKey = 'preparing' | 'in_progress' | 'review' | 'done';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  deadline: string | null; // 'YYYY-MM-DD'
  status: StageKey;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  stage: StageKey;
  title: string;
  is_completed: boolean;
  created_at: string;
}
