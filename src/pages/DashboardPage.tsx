import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  FolderPlus,
  Search,
  Folder,
  Loader2,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Project, StageKey } from '../types';
import { STAGES } from '../lib/constants';
import { getDDay } from '../lib/date';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import NewProjectModal from '../components/NewProjectModal';

interface TaskCount {
  done: number;
  total: number;
}

type StatusFilter = 'all' | StageKey;
type SortKey = 'recent' | 'deadline' | 'name';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: '최신순' },
  { key: 'deadline', label: '마감임박순' },
  { key: 'name', label: '이름순' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, TaskCount>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 검색 / 필터 / 정렬
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: projectData } = await supabase
      .from(TABLES.projects)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const list = (projectData as Project[]) ?? [];
    setProjects(list);

    if (list.length > 0) {
      const { data: taskData } = await supabase
        .from(TABLES.tasks)
        .select('project_id, is_completed')
        .in(
          'project_id',
          list.map((p) => p.id)
        );

      const next: Record<string, TaskCount> = {};
      list.forEach((p) => (next[p.id] = { done: 0, total: 0 }));
      (taskData ?? []).forEach((t: { project_id: string; is_completed: boolean }) => {
        const c = next[t.project_id];
        if (!c) return;
        c.total += 1;
        if (t.is_completed) c.done += 1;
      });
      setCounts(next);
    } else {
      setCounts({});
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    setCounts((prev) => ({ ...prev, [project.id]: { done: 0, total: 0 } }));
    setModalOpen(false);
  };

  // --- 요약 통계 ---
  const stats = useMemo(() => {
    const ongoing = projects.filter((p) => p.status !== 'done').length;
    const done = projects.filter((p) => p.status === 'done').length;
    const soon = projects.filter((p) => {
      if (p.status === 'done') return false;
      const d = getDDay(p.deadline);
      return d !== null && d.tone !== 'normal'; // 임박(soon) 또는 초과(over)
    }).length;

    let totalTasks = 0;
    let doneTasks = 0;
    Object.values(counts).forEach((c) => {
      totalTasks += c.total;
      doneTasks += c.done;
    });
    const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return { ongoing, done, soon, rate };
  }, [projects, counts]);

  // --- 검색 / 필터 / 정렬 적용 ---
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sort === 'deadline') {
        // 마감일 가까운 순, 없는 건 맨 뒤로
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      // recent: created_at 내림차순
      return b.created_at.localeCompare(a.created_at);
    });

    return list;
  }, [projects, query, status, sort]);

  return (
    <Layout>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">내 프로젝트</h1>
          <p className="text-sm text-slate-500">
            전체 {projects.length}개의 프로젝트를 관리하고 있어요.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">새 프로젝트</span>
        </button>
      </div>

      {loading ? (
        <Spinner label="프로젝트를 불러오는 중..." />
      ) : projects.length === 0 ? (
        <EmptyState onCreate={() => setModalOpen(true)} />
      ) : (
        <>
          {/* 요약 통계 */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Folder} label="전체 프로젝트" value={`${projects.length}`} tone="slate" />
            <StatCard icon={Loader2} label="진행 중" value={`${stats.ongoing}`} tone="brand" />
            <StatCard icon={CalendarClock} label="마감 임박" value={`${stats.soon}`} tone="amber" />
            <StatCard
              icon={CheckCircle2}
              label="평균 완료율"
              value={`${stats.rate}%`}
              tone="emerald"
            />
          </div>

          {/* 검색 / 필터 / 정렬 */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="프로젝트 이름·설명 검색"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterChip active={status === 'all'} onClick={() => setStatus('all')}>
                전체
              </FilterChip>
              {STAGES.map((s) => (
                <FilterChip
                  key={s.key}
                  active={status === s.key}
                  onClick={() => setStatus(s.key)}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </FilterChip>
              ))}

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="ml-auto rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none transition focus:border-brand-400"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 목록 */}
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
              조건에 맞는 프로젝트가 없어요.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visible.map((p) => {
                const c = counts[p.id] ?? { done: 0, total: 0 };
                return <ProjectCard key={p.id} project={p} done={c.done} total={c.total} />;
              })}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <NewProjectModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      )}
    </Layout>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <FolderPlus className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-slate-900">아직 프로젝트가 없어요</h3>
      <p className="mt-1 mb-5 text-sm text-slate-500">첫 프로젝트를 만들고 시작해 보세요.</p>
      <button
        onClick={onCreate}
        className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        <Plus className="h-4 w-4" />새 프로젝트 만들기
      </button>
    </div>
  );
}
