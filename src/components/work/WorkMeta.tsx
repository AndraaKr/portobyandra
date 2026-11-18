import React from 'react';
import type { Work } from '../../utils/work';
import { formatDuration, formatRoles } from '../../utils/work';

interface WorkMetaProps {
  work: Work;
  className?: string;
}

export const WorkMeta: React.FC<WorkMetaProps> = ({ work, className = '' }) => {
  const rolesText = formatRoles(work.roles);
  const isStatic = work.category === 'Desain' || work.mediaType === 'image';
  const durationText = isStatic ? 'Statis' : formatDuration(work.durationSeconds);
  const clientText = work.client || '—';
  const yearText = work.workYear ? String(work.workYear) : '—';

  return (
    <div className={`label-mono text-ink-2 space-y-2 text-xs max-w-sm ${className}`}>
      <div className="flex items-baseline justify-between border-b border-rule pb-1">
        <span className="text-ink font-semibold">PERAN</span>
        <span className="text-ink font-medium text-right">{rolesText}</span>
      </div>
      <div className="flex items-baseline justify-between border-b border-rule pb-1">
        <span className="text-ink font-semibold">DURASI</span>
        <span className="text-ink-2 text-right">{durationText}</span>
      </div>
      <div className="flex items-baseline justify-between border-b border-rule pb-1">
        <span className="text-ink font-semibold">KLIEN</span>
        <span className="text-ink text-right">{clientText}</span>
      </div>
      <div className="flex items-baseline justify-between pt-0.5">
        <span className="text-ink font-semibold">TAHUN</span>
        <span className="text-ink font-bold text-right">{yearText}</span>
      </div>
    </div>
  );
};
