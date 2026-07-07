import React from 'react';

interface ProgressBarProps {
  done: number;
  total: number;
}

export default function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>할일 진행률</span>
        <span className="font-medium text-slate-700">
          {done}/{total} · {percent}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
