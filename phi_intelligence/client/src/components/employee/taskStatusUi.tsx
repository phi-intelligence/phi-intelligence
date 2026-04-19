/** Shared Jira-style status labels + pill classes for task UIs (light theme). */

export type TaskStatusKey =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'BLOCKED'
  | 'DONE';

export const TASK_STATUS_ROWS: {
  key: TaskStatusKey;
  label: string;
  pill: string;
  selectRing: string;
}[] = [
  {
    key: 'BACKLOG',
    label: 'Backlog',
    pill: 'bg-stone-100 text-stone-600 border border-stone-300',
    selectRing: 'ring-2 ring-stone-300 border-stone-300',
  },
  {
    key: 'TODO',
    label: 'To do',
    pill: 'bg-slate-100 text-slate-600 border border-slate-300',
    selectRing: 'ring-2 ring-slate-300 border-slate-300',
  },
  {
    key: 'IN_PROGRESS',
    label: 'In progress',
    pill: 'bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/30',
    selectRing: 'ring-2 ring-[#00A3FF]/40 border-[#00A3FF]/30',
  },
  {
    key: 'IN_REVIEW',
    label: 'In review',
    pill: 'bg-violet-50 text-violet-700 border border-violet-200',
    selectRing: 'ring-2 ring-violet-300 border-violet-200',
  },
  {
    key: 'BLOCKED',
    label: 'Blocked',
    pill: 'bg-red-50 text-red-600 border border-red-200',
    selectRing: 'ring-2 ring-red-300 border-red-200',
  },
  {
    key: 'DONE',
    label: 'Done',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    selectRing: 'ring-2 ring-emerald-300 border-emerald-200',
  },
];

export function taskStatusMeta(status: string | undefined) {
  const row = TASK_STATUS_ROWS.find((r) => r.key === status) ?? TASK_STATUS_ROWS[0];
  return row;
}

export function TaskStatusPill({ status }: { status: string | undefined }) {
  const { key, label, pill } = taskStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center justify-center min-h-[2rem] px-3 rounded-full text-[10px] font-bold tracking-widest uppercase ${pill}`}
      title={key}
    >
      {label}
    </span>
  );
}
