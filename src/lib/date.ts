// 날짜 관련 헬퍼 (한국어 표기 + D-Day 계산)

/** 'YYYY-MM-DD' → '2026년 6월 28일' */
export function formatKoreanDate(dateStr: string | null): string {
  if (!dateStr) return '마감일 없음';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '마감일 없음';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export interface DDay {
  label: string;
  /** 마감 임박/초과 여부 — 색상 강조용 */
  tone: 'normal' | 'soon' | 'over';
}

/** 오늘 기준 D-Day 라벨과 강조 톤을 반환 */
export function getDDay(dateStr: string | null): DDay | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  if (isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return { label: 'D-Day', tone: 'soon' };
  if (diffDays > 0) {
    return { label: `D-${diffDays}`, tone: diffDays <= 3 ? 'soon' : 'normal' };
  }
  return { label: `D+${Math.abs(diffDays)}`, tone: 'over' };
}
