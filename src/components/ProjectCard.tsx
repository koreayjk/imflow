import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import { formatKoreanDate, getDDay } from '../lib/date';
import StageBadge from './StageBadge';
import ProgressBar from './ProgressBar';

interface ProjectCardProps {
  project: Project;
  done: number;
  total: number;
}

const DDAY_TONE: Record<string, string> = {
  normal: 'text-slate-500',
  soon: 'text-amber-600',
  over: 'text-red-600',
};

export default function ProjectCard({ project, done, total }: ProjectCardProps) {
  const dday = getDDay(project.deadline);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{project.name}</h3>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{project.description}</p>
          )}
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-brand-400" />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <StageBadge stage={project.status} />
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatKoreanDate(project.deadline)}
        </span>
        {dday && (
          <span className={`ml-auto text-xs font-semibold ${DDAY_TONE[dday.tone]}`}>
            {dday.label}
          </span>
        )}
      </div>

      <ProgressBar done={done} total={total} />
    </Link>
  );
}
