import { StageKey } from '../types';

export interface StageMeta {
  key: StageKey;
  label: string;
  /** 배지/컬럼 헤더용 Tailwind 클래스 */
  badge: string;
  dot: string;
}

// 준비 → 진행 → 검토 → 완료
export const STAGES: StageMeta[] = [
  { key: 'preparing', label: '준비', badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  { key: 'in_progress', label: '진행', badge: 'bg-brand-100 text-brand-700', dot: 'bg-brand-500' },
  { key: 'review', label: '검토', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { key: 'done', label: '완료', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
];

export const STAGE_MAP: Record<StageKey, StageMeta> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.key]: s }),
  {} as Record<StageKey, StageMeta>
);

export const STAGE_KEYS: StageKey[] = STAGES.map((s) => s.key);

/** 현재 단계의 다음 단계 키 (마지막이면 null) */
export function nextStage(stage: StageKey): StageKey | null {
  const idx = STAGE_KEYS.indexOf(stage);
  return idx >= 0 && idx < STAGE_KEYS.length - 1 ? STAGE_KEYS[idx + 1] : null;
}
