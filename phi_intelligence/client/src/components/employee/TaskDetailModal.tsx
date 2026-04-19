import { useEffect, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { useEmployee } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, X, Send, Clock4, ChevronDown } from 'lucide-react';
import { TaskStatusPill, TASK_STATUS_ROWS, taskStatusMeta } from '@/components/employee/taskStatusUi';

type TaskMini = {
  id: string;
  title?: string;
  status?: string;
};

type TaskDetailModalProps = {
  task: TaskMini | null;
  onClose: () => void;
  onChanged?: () => void;
};

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const PRIORITY_PILL: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-600 border-red-200',
};

function fullName(profile?: { first_name?: string | null; last_name?: string | null } | null) {
  if (!profile) return '';
  const parts = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  return parts;
}

export default function TaskDetailModal({ task, onClose, onChanged }: TaskDetailModalProps) {
  const { user } = useEmployee();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [comment, setComment] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logDescription, setLogDescription] = useState('');

  useEffect(() => {
    if (!task?.id) {
      setDetail(null);
      return;
    }
    loadDetail();
  }, [task?.id]);

  async function loadDetail() {
    if (!task?.id) return;
    try {
      setLoading(true);
      const res = await tmsApi.get<{ data: any }>(`/tasks/${task.id}`);
      setDetail(res.data || null);
    } catch (err: any) {
      toast({ title: 'Failed to load task', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  if (!task) return null;

  const isAssignee = detail?.assignee_id === user?.id;
  const isProjectLead =
    !!detail?.project?.project_lead_id && detail.project.project_lead_id === user?.id;
  const canEditMeta = user?.role === 'ADMIN' || isProjectLead;
  const canChangeStatus = canEditMeta || isAssignee;
  const canLogTime = canEditMeta || isAssignee;

  const estimated = Number(detail?.estimated_hours) || 0;
  const actual = Number(detail?.actual_hours) || 0;
  const percent = estimated > 0 ? Math.min(100, Math.round((actual / estimated) * 100)) : detail?.status === 'DONE' ? 100 : 0;

  async function patchTask(payload: any) {
    if (!task) return;
    setSaving(true);
    try {
      await tmsApi.put(`/tasks/${task.id}`, payload);
      await loadDetail();
      onChanged?.();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(value: string) {
    if (!task) return;
    setSaving(true);
    try {
      await tmsApi.put(`/tasks/${task.id}/status`, { status: value });
      await loadDetail();
      onChanged?.();
    } catch (err: any) {
      toast({ title: 'Status update failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function addComment() {
    if (!task || !comment.trim()) return;
    setSaving(true);
    try {
      await tmsApi.post(`/tasks/${task.id}/comments`, { content: comment.trim() });
      setComment('');
      await loadDetail();
    } catch (err: any) {
      toast({ title: 'Comment failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function logTime() {
    if (!task || !detail) return;
    const hours = parseFloat(logHours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      toast({ title: 'Hours must be 0–24', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await tmsApi.post('/timelogs/', {
        project_id: detail.project_id,
        task_id: task.id,
        date: new Date().toISOString(),
        hours,
        description: logDescription || undefined,
        is_billable: true,
      });
      setLogHours('');
      setLogDescription('');
      await loadDetail();
      onChanged?.();
      toast({ title: `Logged ${hours}h on this task` });
    } catch (err: any) {
      toast({ title: 'Log time failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-stone-400 uppercase">Task</p>
            <h2 className="text-lg font-bold text-stone-900 truncate">{detail?.title || task.title}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-2 rounded-lg hover:bg-stone-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !detail ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Status</p>
                {canChangeStatus ? (
                  <div
                    className={`relative rounded-xl bg-white shadow-sm ${taskStatusMeta(detail.status).selectRing}`}
                  >
                    <select
                      value={detail.status}
                      onChange={(e) => changeStatus(e.target.value)}
                      disabled={saving}
                      className="w-full appearance-none cursor-pointer rounded-xl bg-transparent border-0 px-3 py-2.5 pr-9 text-sm font-bold text-stone-900 tracking-wide focus:outline-none focus:ring-0"
                    >
                      {TASK_STATUS_ROWS.map((row) => (
                        <option key={row.key} value={row.key}>
                          {row.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  </div>
                ) : (
                  <div className="flex items-stretch">
                    <TaskStatusPill status={detail.status} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Priority</p>
                {canEditMeta ? (
                  <div className="relative rounded-xl ring-2 ring-amber-300 border border-amber-200 bg-white shadow-sm">
                    <select
                      value={detail.priority}
                      onChange={(e) => patchTask({ priority: e.target.value })}
                      disabled={saving}
                      className="w-full appearance-none cursor-pointer rounded-xl bg-transparent border-0 px-3 py-2.5 pr-9 text-sm font-bold text-stone-900 tracking-wide focus:outline-none"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  </div>
                ) : (
                  <span
                    className={`inline-flex min-h-[2.5rem] items-center rounded-full border px-3 text-[10px] font-bold tracking-widest uppercase ${
                      PRIORITY_PILL[detail.priority] || PRIORITY_PILL.MEDIUM
                    }`}
                  >
                    {detail.priority}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Due date</p>
                {canEditMeta ? (
                  <input
                    type="date"
                    value={detail.due_date ? String(detail.due_date).slice(0, 10) : ''}
                    onChange={(e) =>
                      patchTask({
                        due_date: e.target.value
                          ? new Date(e.target.value + 'T12:00:00').toISOString()
                          : null,
                      })
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20 focus:outline-none"
                  />
                ) : (
                  <p className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
                    {detail.due_date ? format(new Date(detail.due_date), 'MMM d, yyyy') : '—'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Assignee</p>
                <p className="text-sm text-stone-700 font-medium truncate">
                  {detail.assignee
                    ? fullName(detail.assignee.profile) || detail.assignee.username || detail.assignee.email
                    : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-stone-400">
                <span>Progress</span>
                <span className="text-stone-700 font-bold font-rajdhani">
                  {actual.toFixed(1)} / {estimated > 0 ? estimated.toFixed(1) : '—'} h ({percent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A3FF] transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="text-xs text-stone-500 font-medium">
                  Estimated hours
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    defaultValue={detail.estimated_hours ?? ''}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (Number.isFinite(v) && v !== detail.estimated_hours) patchTask({ estimated_hours: v });
                    }}
                    disabled={!canEditMeta || saving}
                    className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm disabled:opacity-50 focus:outline-none focus:border-[#00A3FF]"
                  />
                </label>
                <label className="text-xs text-stone-500 font-medium">
                  Actual hours (manual)
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    defaultValue={detail.actual_hours ?? ''}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (Number.isFinite(v) && v !== detail.actual_hours) patchTask({ actual_hours: v });
                    }}
                    disabled={!canEditMeta || saving}
                    className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm disabled:opacity-50 focus:outline-none focus:border-[#00A3FF]"
                  />
                </label>
              </div>
              <p className="text-[10px] text-stone-400">
                Logging time below auto-updates Actual hours and the % bar.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-400">Description</p>
              {canEditMeta ? (
                <textarea
                  defaultValue={detail.description ?? ''}
                  onBlur={(e) => {
                    const v = e.target.value;
                    if (v !== (detail.description ?? '')) patchTask({ description: v });
                  }}
                  disabled={saving}
                  rows={4}
                  placeholder="Describe what needs to be done"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
                />
              ) : (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 whitespace-pre-wrap min-h-[5rem]">
                  {detail.description?.trim() ? detail.description : (
                    <span className="text-stone-400">No description</span>
                  )}
                </div>
              )}
            </div>

            {canLogTime && (
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 flex items-center gap-2">
                <Clock4 className="w-3.5 h-3.5" /> Log time
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  placeholder="Hours"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
                />
                <input
                  type="text"
                  placeholder="What did you work on?"
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  className="sm:col-span-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
                />
              </div>
              <button
                type="button"
                onClick={logTime}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#00A3FF] text-white text-xs font-semibold tracking-widest uppercase disabled:opacity-50 shadow-sm hover:bg-[#0090e0]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log time'}
              </button>
            </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-400">Comments</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(detail.comments || []).length === 0 && (
                  <p className="text-xs text-stone-400">No comments yet.</p>
                )}
                {(detail.comments || []).map((c: any) => (
                  <div key={c.id} className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1 text-[10px] uppercase tracking-widest text-stone-400">
                      <span>
                        {fullName(c.user?.profile) || c.user?.username || 'User'}
                      </span>
                      <span>{c.created_at ? format(new Date(c.created_at), 'MMM d, HH:mm') : ''}</span>
                    </div>
                    <p className="text-sm text-stone-700 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
                />
                <button
                  onClick={addComment}
                  disabled={saving || !comment.trim()}
                  className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold disabled:opacity-40 border border-stone-200 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-[10px] text-stone-400 pt-2 border-t border-stone-100">
              Created {detail.created_at ? format(new Date(detail.created_at), 'PPpp') : '—'} · Updated{' '}
              {detail.updated_at ? format(new Date(detail.updated_at), 'PPpp') : '—'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
