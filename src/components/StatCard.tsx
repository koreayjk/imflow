import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: 'brand' | 'amber' | 'emerald' | 'slate';
}

const TONE: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ icon: Icon, label, value, tone = 'slate' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${TONE[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-2xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
