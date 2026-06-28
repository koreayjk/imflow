import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { STAGES } from '../lib/constants';
import { getDDay } from '../lib/date';

interface TaskCount {
  done: number;
  total: number;
}

interface ProjectBoardProps {
  projects: Project[];
  counts: Record<string, TaskCount>;
}

const DDAY_TONE: Record<string, string> = {
  normal: 'text-slate-400',
  soon: 'text-amber-600',
  over: 'text-red-600',
};

// 프로젝트를 현재 단계(status)별 칼럼으로 보여주는 칸반 보드
export default function ProjectBoard({ projects, counts }: ProjectBoardProps) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
      {STAGES.map((stage) => {
        const items = projects.filter((p) => p.status === stage.key);
        return (
          <section
            key={stage.key}
            className="w-60 shrink-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:w-auto"
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
              <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
              <span className="ml-auto text-xs font-medium text-slate-400">{items.length}</span>
            </header>

            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  없음
                </p>
              ) : (
                items.map((p) => {
                  const c = counts[p.id] ?? { done: 0, total: 0 };
                  const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
                  const dday = getDDay(p.deadline);
                  return (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-3 shadow-card transition hover:border-brand-200 hover:shadow-card-hover"
                    >
                      <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {c.done}/{c.total} 할일
                        </span>
                        {dday && (
                          <span className={`font-semibold ${DDAY_TONE[dday.tone]}`}>
                            {dday.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
