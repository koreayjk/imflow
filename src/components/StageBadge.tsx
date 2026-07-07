import React from 'react';
import { StageKey } from '../types';
import { STAGE_MAP } from '../lib/constants';

export default function StageBadge({ stage }: { stage: StageKey }) {
  const meta = STAGE_MAP[stage];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
