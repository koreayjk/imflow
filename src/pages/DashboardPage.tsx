import React, { useCallback, useEffect, useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import ProjectCard from '../components/ProjectCard';
import NewProjectModal from '../components/NewProjectModal';

interface TaskCount {
  done: number;
  total: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, TaskCount>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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
        <div className="grid grid-cols-1 gap-4">
          {projects.map((p) => {
            const c = counts[p.id] ?? { done: 0, total: 0 };
            return <ProjectCard key={p.id} project={p} done={c.done} total={c.total} />;
          })}
        </div>
      )}

      {modalOpen && (
        <NewProjectModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      )}
    </Layout>
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
