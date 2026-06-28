import React from 'react';
import { Check, ChevronRight, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { nextStage } from '../lib/constants';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onMove: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onMove, onDelete }: TaskItemProps) {
  const canMove = nextStage(task.stage) !== null && !task.is_completed;

  return (
    <div className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
      <button
        onClick={() => onToggle(task)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          task.is_completed
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 text-transparent hover:border-brand-400'
        }`}
        aria-label="완료 토글"
      >
        <Check className="h-3.5 w-3.5" />
      </button>

      <span
        className={`flex-1 text-sm ${
          task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'
        }`}
      >
        {task.title}
      </span>

      {canMove && (
        <button
          onClick={() => onMove(task)}
          className="shrink-0 rounded p-1 text-slate-300 transition hover:bg-brand-50 hover:text-brand-500 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="다음 단계로 이동"
          title="다음 단계로 이동"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={() => onDelete(task)}
        className="shrink-0 rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="할일 삭제"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
