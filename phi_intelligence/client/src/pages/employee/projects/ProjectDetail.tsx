import { useEffect, useMemo, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { tmsApi } from '@/services/tmsApi';
import { Loader2, LayoutGrid, Pencil, UserPlus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmployee } from '@/contexts/EmployeeContext';

type Member = {
  id: string;
  user_id: string;
  role: string;
  allocation_percentage: number;
  user?: {
    id: string;
    username?: string;
    email?: string;
    profile?: { first_name?: string | null; last_name?: string | null; designation?: string | null } | null;
  } | null;
};

function fullName(p?: { first_name?: string | null; last_name?: string | null } | null) {
  if (!p) return '';
  return [p.first_name, p.last_name].filter(Boolean).join(' ');
}

export default function ProjectDetail() {
  const [, params] = useRoute('/employee/projects/:id');
  const projectId = params?.id;
  const { toast } = useToast();
  const { user } = useEmployee();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ user_id: '', role: 'Member', allocation_percentage: 100 });
  const [busy, setBusy] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isLead = project?.project_lead_id === user?.id;
  const canManage = isAdmin || isLead;

  useEffect(() => {
    if (projectId) loadAll();
  }, [projectId]);

  async function loadAll() {
    try {
      setLoading(true);
      const [projRes, tasksRes, metricsRes] = await Promise.all([
        tmsApi.get<{ data: any }>(`/projects/${projectId}`),
        tmsApi.get<{ data: any[] }>(`/projects/${projectId}/tasks`),
        tmsApi.get<{ data: any }>(`/projects/${projectId}/metrics`).catch(() => ({ data: null }) as any),
      ]);
      setProject(projRes.data || projRes);
      setTasks(tasksRes.data || (tasksRes as any) || []);
      setMetrics((metricsRes as any).data ?? null);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load project details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!showAddMember || employees.length > 0) return;
    (async () => {
      try {
        const res = await tmsApi.get<{ data: any[] }>('/employees?limit=200');
        setEmployees(res.data || []);
      } catch {
        setEmployees([]);
      }
    })();
  }, [showAddMember, employees.length]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const blocked = tasks.filter((t) => t.status === 'BLOCKED').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const review = tasks.filter((t) => t.status === 'IN_REVIEW').length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, blocked, todo, review, percent };
  }, [tasks]);

  async function addMember() {
    if (!memberForm.user_id) {
      toast({ title: 'Pick a user', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      await tmsApi.post(`/projects/${projectId}/members`, memberForm);
      toast({ title: 'Member added' });
      setShowAddMember(false);
      setMemberForm({ user_id: '', role: 'Member', allocation_percentage: 100 });
      loadAll();
    } catch (err: any) {
      toast({ title: 'Add failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm('Remove this team member?')) return;
    setBusy(true);
    try {
      await tmsApi.delete(`/projects/${projectId}/members/${userId}`);
      toast({ title: 'Member removed' });
      loadAll();
    } catch (err: any) {
      toast({ title: 'Remove failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12 text-stone-400">Project not found</div>;
  }

  const members: Member[] = project.members || [];
  const memberUserIds = new Set(members.map((m) => m.user_id));
  const availableEmployees = employees.filter((e: any) => !memberUserIds.has(e.id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">{project.name}</h1>
          <p className="text-stone-500 mt-1 text-sm">{project.description}</p>
          <p className="text-stone-400 text-xs mt-2 tracking-wider uppercase">
            {project.project_code} · {project.status} · {project.region}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/employee/projects/${projectId}/tasks`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20 text-xs font-semibold tracking-widest uppercase cursor-pointer hover:bg-[#dbeeff] transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Task board
            </span>
          </Link>
          {canManage && (
            <Link href={`/employee/projects/${projectId}/edit`}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold tracking-widest uppercase cursor-pointer hover:bg-stone-50 transition-colors">
                <Pencil className="w-4 h-4" />
                Edit
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks total', value: taskStats.total, accent: 'text-stone-900' },
          { label: 'Completed', value: `${taskStats.done} (${taskStats.percent}%)`, accent: 'text-emerald-600' },
          { label: 'In progress', value: taskStats.inProgress, accent: 'text-[#00A3FF]' },
          { label: 'Blocked', value: taskStats.blocked, accent: 'text-red-500' },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5">
            <div className="text-[10px] font-semibold tracking-widest text-stone-400 uppercase mb-2">{c.label}</div>
            <div className={`text-2xl font-bold font-rajdhani ${c.accent}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Project progress</p>
          <p className="text-sm font-bold text-stone-900">{taskStats.percent}%</p>
        </div>
        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00A3FF] to-emerald-400" style={{ width: `${taskStats.percent}%` }} />
        </div>
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs text-stone-500">
            <div>
              <p className="uppercase tracking-widest text-stone-400 mb-1">Estimated hrs</p>
              <p className="text-stone-900 text-base font-semibold">{metrics.estimated_hours ?? project.estimated_hours ?? '—'}</p>
            </div>
            <div>
              <p className="uppercase tracking-widest text-stone-400 mb-1">Actual hrs</p>
              <p className="text-stone-900 text-base font-semibold">{metrics.actual_hours ?? '—'}</p>
            </div>
            <div>
              <p className="uppercase tracking-widest text-stone-400 mb-1">Budget</p>
              <p className="text-stone-900 text-base font-semibold">{project.budget ?? '—'}</p>
            </div>
            <div>
              <p className="uppercase tracking-widest text-stone-400 mb-1">Team size</p>
              <p className="text-stone-900 text-base font-semibold">{metrics.team_size ?? members.length + 1}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 shadow-sm p-6 rounded-2xl grid md:grid-cols-2 gap-6 text-sm text-stone-600">
        <div>
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Client</p>
          <p className="text-stone-900 font-medium">{project.client_name || '—'}</p>
        </div>
        <div>
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Project lead</p>
          <p className="text-stone-900 font-medium">
            {fullName(project.project_lead?.profile) || project.project_lead?.username || '—'}
          </p>
        </div>
        <div>
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Priority</p>
          <p className="text-stone-900 font-medium">{project.priority}</p>
        </div>
        <div>
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Dates</p>
          <p className="text-stone-900 font-medium">
            {project.start_date?.slice?.(0, 10) || '—'} → {project.end_date?.slice?.(0, 10) || '—'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00A3FF]" />
            <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-700">Team ({members.length + 1})</h2>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20 text-[10px] font-semibold tracking-widest uppercase hover:bg-[#dbeeff] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add member
            </button>
          )}
        </div>
        <div className="divide-y divide-stone-100">
          {project.project_lead && (
            <div className="px-6 py-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-stone-900 font-medium">
                  {fullName(project.project_lead.profile) || project.project_lead.username}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#00A3FF]">Project lead</p>
              </div>
            </div>
          )}
          {members.map((m) => (
            <div key={m.id} className="px-6 py-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-stone-900 font-medium">
                  {fullName(m.user?.profile) || m.user?.username || m.user_id}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">
                  {m.role} · {m.allocation_percentage}%
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => removeMember(m.user_id)}
                  className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  disabled={busy}
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div className="px-6 py-6 text-xs text-stone-400">No additional members. Add team members to assign tasks.</div>
          )}
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-stone-200 shadow-2xl rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 tracking-widest uppercase">Add team member</h3>
            <label className="block text-xs text-stone-500 font-medium">
              Employee
              <select
                value={memberForm.user_id}
                onChange={(e) => setMemberForm({ ...memberForm, user_id: e.target.value })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="">Select…</option>
                {availableEmployees.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {fullName(e.profile) || e.username || e.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-stone-500 font-medium">
              Role on project
              <input
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              />
            </label>
            <label className="block text-xs text-stone-500 font-medium">
              Allocation %
              <input
                type="number"
                min={0}
                max={100}
                value={memberForm.allocation_percentage}
                onChange={(e) => setMemberForm({ ...memberForm, allocation_percentage: parseInt(e.target.value || '0') })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowAddMember(false)}
                className="px-5 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold tracking-widest uppercase hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addMember}
                disabled={busy}
                className="px-5 py-2 rounded-lg bg-[#00A3FF] text-white text-xs font-semibold tracking-widest uppercase disabled:opacity-50 shadow-sm hover:bg-[#0090e0]"
              >
                {busy ? 'Adding…' : 'Add member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
