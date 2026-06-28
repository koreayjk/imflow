import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StageMeta } from '../lib/constants';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface StageColumnProps {
  stage: StageMeta;
  tasks: Task[];
  onAdd: (stageKey: Task['stage'], title: string) => Promise<void>;
  onToggle: (task: Task) => void;
  onMove: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function StageColumn({
  stage,
  tasks,
  onAdd,
  onToggle,
  onMove,
  onDelete,
}: StageColumnProps) {
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    await onAdd(stage.key, trimmed);
    setTitle('');
    setAdding(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
        <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
        <span className="ml-auto text-xs font-medium text-slate-400">{tasks.length}</span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-2 flex items-center gap-1.5">
        <input
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할일 추가..."
          className="flex-1 rounded-lg border border-transparent bg-white px-2.5 py-1.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={!title.trim() || adding}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 transition hover:bg-brand-50 hover:text-brand-500 disabled:opacity-50"
          aria-label="할일 추가"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
