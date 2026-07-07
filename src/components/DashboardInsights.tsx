import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { Project } from '../types';
import { STAGES } from '../lib/constants';
import { getDDay, formatKoreanDate } from '../lib/date';

interface TaskCount {
  done: number;
  total: number;
}

interface DashboardInsightsProps {
  projects: Project[];
  counts: Record<string, TaskCount>;
}

const DDAY_TONE: Record<string, string> = {
  normal: 'text-slate-400',
  soon: 'text-amber-600',
  over: 'text-red-600',
};

// SVG 도넛 — 전체 할일 완료율
function ProgressDonut({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative flex items-center justify-center">
      <svg width="148" height="148" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#3b6bf6"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-slate-900">{pct}%</p>
        <p className="text-[11px] text-slate-400">할일 완료</p>
      </div>
    </div>
  );
}

export default function DashboardInsights({ projects, counts }: DashboardInsightsProps) {
  // 전체 할일 집계
  let totalTasks = 0;
  let doneTasks = 0;
  Object.values(counts).forEach((c) => {
    totalTasks += c.total;
    doneTasks += c.done;
  });
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // 단계별 프로젝트 수
  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: projects.filter((p) => p.status === s.key).length,
  }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  // 다가오는 마감 (완료 제외, 마감일 있는 것만, 가까운 순 5개)
  const upcoming = projects
    .filter((p) => p.status !== 'done' && p.deadline)
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 전체 완료율 도넛 */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="mb-3 self-start text-sm font-semibold text-slate-700">전체 진행률</h3>
        <ProgressDonut pct={pct} />
        <p className="mt-3 text-xs text-slate-500">
          전체 {totalTasks}개 중 {doneTasks}개 완료
        </p>
      </div>

      {/* 단계별 분포 막대 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">단계별 프로젝트</h3>
        <div className="space-y-3">
          {stageCounts.map((s) => (
            <div key={s.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <span className="font-medium text-slate-500">{s.count}개</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${s.dot} transition-all duration-500`}
                  style={{ width: `${(s.count / maxStage) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 다가오는 마감 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:col-span-2">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <CalendarClock className="h-4 w-4 text-amber-500" />
          다가오는 마감
        </h3>
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">마감일이 설정된 진행 프로젝트가 없어요.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((p) => {
              const dday = getDDay(p.deadline);
              const c = counts[p.id] ?? { done: 0, total: 0 };
              const ppct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
              return (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center gap-3 py-2.5 transition hover:opacity-70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{formatKoreanDate(p.deadline)}</p>
                    </div>
                    <div className="hidden w-24 sm:block">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${ppct}%` }}
                        />
                      </div>
                    </div>
                    {dday && (
                      <span className={`w-12 text-right text-xs font-bold ${DDAY_TONE[dday.tone]}`}>
                        {dday.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
