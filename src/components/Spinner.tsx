import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 className="h-7 w-7 animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
