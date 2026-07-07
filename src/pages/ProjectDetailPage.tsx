import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Trash2, Check } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { Project, Task, StageKey } from '../types';
import { STAGES, STAGE_KEYS, nextStage } from '../lib/constants';
import { formatKoreanDate, getDDay } from '../lib/date';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import StageColumn from '../components/StageColumn';

const DDAY_TONE: Record<string, string> = {
  normal: 'text-slate-500',
  soon: 'text-amber-600',
  over: 'text-red-600',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const { data: projectData, error } = await supabase
      .from(TABLES.projects)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !projectData) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProject(projectData as Project);

    const { data: taskData } = await supabase
      .from(TABLES.tasks)
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    setTasks((taskData as Task[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // --- 프로젝트 단계 변경 ---
  const changeStatus = async (status: StageKey) => {
    if (!project || project.status === status) return;
    setProject({ ...project, status }); // 낙관적 업데이트
    await supabase.from(TABLES.projects).update({ status }).eq('id', project.id);
  };

  // --- 프로젝트 삭제 ---
  const deleteProject = async () => {
    if (!project) return;
    if (!window.confirm('이 프로젝트와 모든 할일이 삭제됩니다. 계속할까요?')) return;
    await supabase.from(TABLES.projects).delete().eq('id', project.id);
    navigate('/', { replace: true });
  };

  // --- 할일 CRUD ---
  const addTask = async (stage: StageKey, title: string) => {
    if (!project) return;
    const { data } = await supabase
      .from(TABLES.tasks)
      .insert({ project_id: project.id, stage, title })
      .select()
      .single();
    if (data) setTasks((prev) => [...prev, data as Task]);
  };

  const toggleTask = async (task: Task) => {
    const updated = { ...task, is_completed: !task.is_completed };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await supabase.from(TABLES.tasks).update({ is_completed: updated.is_completed }).eq('id', task.id);
  };

  const moveTask = async (task: Task) => {
    const next = nextStage(task.stage);
    if (!next) return;
    const updated = { ...task, stage: next };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await supabase.from(TABLES.tasks).update({ stage: next }).eq('id', task.id);
  };

  const deleteTask = async (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await supabase.from(TABLES.tasks).delete().eq('id', task.id);
  };

  if (loading) {
    return (
      <Layout>
        <Spinner label="프로젝트를 불러오는 중..." />
      </Layout>
    );
  }

  if (notFound || !project) {
    return (
      <Layout>
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">프로젝트를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  const dday = getDDay(project.deadline);
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.is_completed).length;

  return (
    <Layout>
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
        대시보드
      </button>

      {/* 프로젝트 헤더 */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
                {project.description}
              </p>
            )}
          </div>
          <button
            onClick={deleteProject}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">삭제</span>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatKoreanDate(project.deadline)}
          </span>
          {dday && <span className={`font-semibold ${DDAY_TONE[dday.tone]}`}>{dday.label}</span>}
          <span className="text-slate-500">
            할일 {doneTasks}/{totalTasks} 완료
          </span>
        </div>
      </div>

      {/* 단계 스텝퍼 */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-slate-700">프로젝트 단계</p>
        <div className="flex items-center gap-1.5">
          {STAGES.map((stage, idx) => {
            const currentIdx = STAGE_KEYS.indexOf(project.status);
            const active = idx === currentIdx;
            const passed = idx < currentIdx;
            return (
              <React.Fragment key={stage.key}>
                <button
                  onClick={() => changeStatus(stage.key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-600 text-white shadow-card'
                      : passed
                        ? 'bg-brand-50 text-brand-600'
                        : 'bg-white text-slate-500 hover:bg-slate-50'
                  } border ${active ? 'border-brand-600' : 'border-slate-200'}`}
                >
                  {passed && <Check className="h-3.5 w-3.5" />}
                  {stage.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 단계별 할일 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STAGES.map((stage) => (
          <StageColumn
            key={stage.key}
            stage={stage}
            tasks={tasks.filter((t) => t.stage === stage.key)}
            onAdd={addTask}
            onToggle={toggleTask}
            onMove={moveTask}
            onDelete={deleteTask}
          />
        ))}
      </div>
    </Layout>
  );
}
