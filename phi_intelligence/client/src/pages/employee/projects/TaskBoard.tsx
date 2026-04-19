import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from 'wouter';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  Sparkles,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { tmsApi } from '@/services/tmsApi';
import { useToast } from '@/hooks/use-toast';
import { useEmployee } from '@/contexts/EmployeeContext';
import TaskDetailModal from '@/components/employee/TaskDetailModal';
import { TaskStatusPill } from '@/components/employee/taskStatusUi';

type Status = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';

const COLUMNS: { key: Status; label: string; tone: string; ring: string; dot: string }[] = [
  { key: 'BACKLOG', label: 'Backlog', tone: 'text-stone-600', ring: 'border-stone-200', dot: 'bg-stone-400' },
  { key: 'TODO', label: 'To do', tone: 'text-stone-600', ring: 'border-stone-200', dot: 'bg-stone-400' },
  { key: 'IN_PROGRESS', label: 'In progress', tone: 'text-amber-800', ring: 'border-amber-200', dot: 'bg-amber-500' },
  { key: 'IN_REVIEW', label: 'In review', tone: 'text-violet-800', ring: 'border-violet-200', dot: 'bg-violet-500' },
  { key: 'BLOCKED', label: 'Blocked', tone: 'text-rose-800', ring: 'border-rose-200', dot: 'bg-rose-500' },
  { key: 'DONE', label: 'Done', tone: 'text-emerald-800', ring: 'border-emerald-200', dot: 'bg-emerald-500' },
];

// Priority: accent bar + chip tuned for light TMS surfaces.
const PRIORITY_STYLE: Record<
  string,
  { accent: string; chip: string; label: string; icon: typeof ArrowUp }
> = {
  CRITICAL: { accent: 'bg-rose-500', chip: 'text-rose-800 bg-rose-50 border border-rose-100', label: 'Critical', icon: ArrowUp },
  HIGH: { accent: 'bg-orange-500', chip: 'text-orange-800 bg-orange-50 border border-orange-100', label: 'High', icon: ArrowUp },
  MEDIUM: { accent: 'bg-amber-500', chip: 'text-amber-900 bg-amber-50 border border-amber-100', label: 'Medium', icon: ArrowDownRight },
  LOW: { accent: 'bg-emerald-500', chip: 'text-emerald-800 bg-emerald-50 border border-emerald-100', label: 'Low', icon: ArrowDownRight },
};

const AVATAR_PALETTE = [
  'bg-sky-100 text-sky-700 border border-sky-200',
  'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200',
  'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'bg-amber-100 text-amber-900 border border-amber-200',
  'bg-rose-100 text-rose-800 border border-rose-200',
  'bg-cyan-100 text-cyan-800 border border-cyan-200',
  'bg-violet-100 text-violet-800 border border-violet-200',
];

function hashStr(s: string | undefined): number {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function avatarColor(id?: string) {
  return AVATAR_PALETTE[hashStr(id) % AVATAR_PALETTE.length];
}

function shortId(id: string): string {
  const last = id.split('-').pop() || id;
  return `PHI-${last.slice(0, 4).toUpperCase()}`;
}

type Member = {
  id: string;
  username?: string;
  email?: string;
  profile?: { first_name?: string | null; last_name?: string | null } | null;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: string;
  assignee?: Member | null;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  updated_at?: string;
  _count?: { comments?: number; sub_tasks?: number; attachments?: number };
};

function memberName(m?: Member | null) {
  if (!m) return '';
  return (
    [m.profile?.first_name, m.profile?.last_name].filter(Boolean).join(' ') ||
    m.username ||
    m.email ||
    'User'
  );
}

function memberInitials(m?: Member | null) {
  if (!m) return '?';
  const first = m.profile?.first_name?.[0] || m.username?.[0] || '?';
  const last = m.profile?.last_name?.[0] || '';
  return (first + last).toUpperCase();
}

export default function TaskBoard() {
  const [, params] = useRoute('/employee/projects/:id/tasks');
  const projectId = params?.id;
  const { toast } = useToast();
  const { user } = useEmployee();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string>('all'); // 'all' | 'mine' | userId
  const [view, setView] = useState<'board' | 'list'>('board');

  const isAdmin = user?.role === 'ADMIN';
  const isLead = project?.project_lead_id === user?.id;
  const canManage = isAdmin || isLead;
  /** AI plan / generate tasks — admins only (API enforces the same). */
  const canUseAiPlanner = isAdmin;

  useEffect(() => {
    if (projectId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchData() {
    if (!projectId) return;
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        tmsApi.get<{ data: any }>(`/projects/${projectId}`),
        tmsApi.get<{ data: Task[] }>(`/projects/${projectId}/tasks`),
      ]);
      setProject((projRes as any).data || projRes);
      setTasks(((tasksRes as any).data || tasksRes || []) as Task[]);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to load task board',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(taskId: string, next: Status) {
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    try {
      await tmsApi.put(`/tasks/${taskId}/status`, { status: next });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
      fetchData();
    }
  }

  const assignableMembers: Member[] = useMemo(() => {
    if (!project) return [];
    const seen = new Set<string>();
    const list: Member[] = [];
    if (project.project_lead) {
      list.push(project.project_lead);
      seen.add(project.project_lead.id);
    }
    for (const m of project.members || []) {
      const u = m.user;
      if (u && !seen.has(u.id)) {
        list.push(u);
        seen.add(u.id);
      }
    }
    return list;
  }, [project]);

  const visibleTasks = useMemo(() => {
    if (filterAssignee === 'all') return tasks;
    if (filterAssignee === 'mine') return tasks.filter((t) => t.assignee?.id === user?.id);
    return tasks.filter((t) => t.assignee?.id === filterAssignee);
  }, [tasks, filterAssignee, user?.id]);

  const counts = useMemo(() => {
    const obj: Record<Status, number> = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      BLOCKED: 0,
      DONE: 0,
    };
    visibleTasks.forEach((t) => {
      if (obj[t.status] != null) obj[t.status] += 1;
    });
    return obj;
  }, [visibleTasks]);

  const totalProgress = useMemo(() => {
    if (visibleTasks.length === 0) return 0;
    return Math.round((counts.DONE / visibleTasks.length) * 100);
  }, [counts.DONE, visibleTasks.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="space-y-4">
        <Link href={`/employee/projects/${projectId}`}>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 hover:text-stone-800 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back to project
          </span>
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#00A3FF] mb-1 font-semibold">Board</p>
            <h1 className="text-3xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">
              {project?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-500">
              {project?.project_lead && (
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20 flex items-center justify-center text-[10px] font-bold">
                    {memberInitials(project.project_lead)}
                  </span>
                  Lead · {memberName(project.project_lead)}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> {assignableMembers.length} member(s)
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {totalProgress}% done
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <ViewToggle value={view} onChange={setView} />
            <FilterMenu
              value={filterAssignee}
              onChange={setFilterAssignee}
              members={assignableMembers}
              currentUserId={user?.id ?? null}
            />
            {canUseAiPlanner && (
              <button
                type="button"
                onClick={() => setShowAI(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 text-[11px] font-bold tracking-widest uppercase shadow-sm"
              >
                <Wand2 className="w-3.5 h-3.5" /> AI plan
              </button>
            )}
            {canManage && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00A3FF] text-white text-[11px] font-bold tracking-widest uppercase shadow-md shadow-[#00A3FF]/25 hover:bg-[#0090e0]"
              >
                <Plus className="w-3.5 h-3.5" /> New task
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00A3FF] to-violet-500 transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Body: board or list */}
      {view === 'board' ? (
        <div className="flex-1 overflow-x-auto pb-6 -mx-2 px-2">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((col) => {
              const columnTasks = visibleTasks.filter((t) => t.status === col.key);
              const isDropping = dragOverColumn === col.key;
              return (
                <div
                  key={col.key}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverColumn(col.key);
                  }}
                  onDragLeave={() => setDragOverColumn((c) => (c === col.key ? null : c))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverColumn(null);
                    const taskId = e.dataTransfer.getData('taskId');
                    const task = tasks.find((t) => t.id === taskId);
                    if (!task || task.status === col.key) return;
                    const mayMove =
                      canManage || task.assignee?.id === user?.id;
                    if (mayMove) updateStatus(taskId, col.key);
                  }}
                  className={`w-[320px] flex flex-col rounded-2xl border ${col.ring} bg-stone-50/80 overflow-hidden transition-all ${
                    isDropping ? 'border-[#00A3FF] ring-2 ring-[#00A3FF]/30 bg-[#EBF5FF]/50' : ''
                  }`}
                >
                  <div className="px-4 py-3 border-b border-stone-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <h3 className={`text-xs font-bold tracking-[0.2em] uppercase ${col.tone}`}>
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-[10px] tracking-widest text-stone-400 font-bold">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[200px] bg-stone-50/50">
                    {columnTasks.length === 0 ? (
                      <div className="h-full min-h-[160px] flex items-center justify-center text-xs text-stone-400 border border-dashed border-stone-300 rounded-xl bg-white/60">
                        Drop tasks here
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const mayDrag =
                          canManage || task.assignee?.id === user?.id;
                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            canManage={mayDrag}
                            onClick={() => setActiveTask(task)}
                            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <TaskListView
          tasks={visibleTasks}
          currentUserId={user?.id ?? null}
          canManage={canManage}
          onOpen={setActiveTask}
          onStatusChange={updateStatus}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          members={assignableMembers}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
          projectId={projectId!}
        />
      )}

      {showAI && (
        <AIPlanProjectModal
          projectId={projectId!}
          projectName={project?.name || ''}
          onClose={() => setShowAI(false)}
          onApplied={() => {
            setShowAI(false);
            fetchData();
          }}
        />
      )}

      <TaskDetailModal
        task={activeTask}
        onClose={() => setActiveTask(null)}
        onChanged={fetchData}
      />
    </div>
  );
}

function TaskCard({
  task,
  canManage,
  onClick,
  onDragStart,
}: {
  task: Task;
  canManage: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const estimated = Number(task.estimated_hours) || 0;
  const actual = Number(task.actual_hours) || 0;
  const percent =
    estimated > 0
      ? Math.min(100, Math.round((actual / estimated) * 100))
      : task.status === 'DONE'
        ? 100
        : 0;
  const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'DONE';
  const priority = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.MEDIUM;
  const PriorityIcon = priority.icon;
  const comments = task._count?.comments ?? 0;
  const subs = task._count?.sub_tasks ?? 0;
  const attachments = task._count?.attachments ?? 0;
  const labels = (task as any).labels as string[] | undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={canManage}
      onDragStart={canManage ? onDragStart : undefined}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' ? onClick() : null)}
      className={`group relative overflow-hidden rounded-xl border border-stone-200 bg-white hover:border-[#00A3FF]/40 hover:shadow-md p-3 transition-all shadow-sm ${
        canManage ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
    >
      {/* Priority accent bar */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${priority.accent}`} />

      <div className="flex items-start justify-between gap-2 mb-2 pl-2">
        <span className="font-mono text-[10px] tracking-widest text-stone-400">
          {shortId(task.id)}
        </span>
        {task.assignee && (
          <div
            title={memberName(task.assignee)}
            className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold flex-shrink-0 ${avatarColor(task.assignee.id)}`}
          >
            {memberInitials(task.assignee)}
          </div>
        )}
      </div>

      <p className="text-sm text-stone-900 leading-snug mb-3 pl-2 line-clamp-3 group-hover:text-[#00A3FF] transition-colors">
        {task.title}
      </p>

      {labels && labels.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-2 mb-3">
          {labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-[9px] uppercase tracking-widest text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pl-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded ${priority.chip}`}
        >
          <PriorityIcon className="w-3 h-3" />
          {priority.label}
        </span>
        {task.due_date ? (
          <span
            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest ${
              overdue ? 'text-rose-600' : 'text-stone-400'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        ) : (
          <span className="text-[10px] text-stone-300">no due date</span>
        )}
      </div>

      <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden ml-2">
        <div
          className={`h-full ${task.status === 'DONE' ? 'bg-emerald-500' : 'bg-[#00A3FF]'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 pt-2 pl-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 tracking-widest">
        <span className="font-mono">
          {actual.toFixed(1)}h<span className="text-stone-300"> / {estimated.toFixed(1)}h</span>
        </span>
        <div className="flex items-center gap-3">
          {subs > 0 && (
            <span className="inline-flex items-center gap-1" title="Sub-tasks">
              <CheckCircle2 className="w-3 h-3" />
              {subs}
            </span>
          )}
          {comments > 0 && (
            <span className="inline-flex items-center gap-1" title="Comments">
              <MessageSquare className="w-3 h-3" />
              {comments}
            </span>
          )}
          {attachments > 0 && (
            <span className="inline-flex items-center gap-1" title="Attachments">
              <Paperclip className="w-3 h-3" />
              {attachments}
            </span>
          )}
          {comments + subs + attachments === 0 && task.updated_at && (
            <span title={format(new Date(task.updated_at), 'PPpp')}>
              {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: 'board' | 'list';
  onChange: (v: 'board' | 'list') => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('board')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors ${
          value === 'board' ? 'bg-[#00A3FF] text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <LayoutGrid className="w-3 h-3" /> Board
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors ${
          value === 'list' ? 'bg-[#00A3FF] text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <List className="w-3 h-3" /> List
      </button>
    </div>
  );
}

function TaskListView({
  tasks,
  currentUserId,
  canManage,
  onOpen,
  onStatusChange,
}: {
  tasks: Task[];
  currentUserId: string | null;
  canManage: boolean;
  onOpen: (t: Task) => void;
  onStatusChange: (id: string, s: Status) => void;
}) {
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee'>('status');
  const groups = useMemo(() => {
    const map = new Map<string, Task[]>();
    const order: string[] = [];
    const keyOf = (t: Task): string => {
      if (groupBy === 'status') return t.status;
      if (groupBy === 'priority') return t.priority || 'MEDIUM';
      return t.assignee ? memberName(t.assignee) : 'Unassigned';
    };
    for (const t of tasks) {
      const key = keyOf(t);
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(t);
    }
    const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const statusOrder: Status[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'];
    const sorted = [...order].sort((a, b) => {
      if (groupBy === 'status') return statusOrder.indexOf(a as Status) - statusOrder.indexOf(b as Status);
      if (groupBy === 'priority') return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
      return a.localeCompare(b);
    });
    return sorted.map((key) => [key, map.get(key)!] as const);
  }, [tasks, groupBy]);

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold">
          {tasks.length} task{tasks.length === 1 ? '' : 's'}
        </p>
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
          Group by
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="bg-white border border-stone-200 rounded-full px-3 py-1 text-stone-800 focus:outline-none focus:border-[#00A3FF] shadow-sm"
          >
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="assignee">Assignee</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-[1.6rem_minmax(0,1fr)_7rem_8rem_6rem_7rem_5rem] items-center gap-3 px-4 py-2 bg-stone-50 text-[10px] uppercase tracking-widest text-stone-500 font-bold border-b border-stone-200">
          <div />
          <div>Task</div>
          <div>Status</div>
          <div>Assignee</div>
          <div>Priority</div>
          <div>Due</div>
          <div className="text-right">Progress</div>
        </div>

        {groups.map(([key, rows]) => (
          <div key={key}>
            <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-600 font-bold">
              <ChevronRight className="w-3 h-3" />
              {key.replace('_', ' ')} <span className="text-stone-400 font-normal">· {rows.length}</span>
            </div>
            {rows.map((task) => {
              const est = Number(task.estimated_hours) || 0;
              const act = Number(task.actual_hours) || 0;
              const percent =
                est > 0 ? Math.min(100, Math.round((act / est) * 100)) : task.status === 'DONE' ? 100 : 0;
              const priority = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.MEDIUM;
              const PriorityIcon = priority.icon;
              const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'DONE';
              return (
                <div
                  key={task.id}
                  onClick={() => onOpen(task)}
                  className="grid grid-cols-[1.6rem_minmax(0,1fr)_7rem_8rem_6rem_7rem_5rem] items-center gap-3 px-4 py-3 border-b border-stone-100 hover:bg-stone-50/80 cursor-pointer text-sm"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${priority.accent}`} />
                  <div className="min-w-0">
                    <p className="text-stone-900 font-medium truncate">{task.title}</p>
                    <p className="font-mono text-[10px] tracking-widest text-stone-400 mt-0.5">
                      {shortId(task.id)}
                    </p>
                  </div>
                  {canManage || task.assignee?.id === currentUserId ? (
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full border-2 border-[#00A3FF]/35 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-900 ring-1 ring-[#00A3FF]/15 shadow-sm"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                      <TaskStatusPill status={task.status} />
                    </span>
                  )}
                  {task.assignee ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${avatarColor(task.assignee.id)}`}
                      >
                        {memberInitials(task.assignee)}
                      </span>
                      <span className="truncate text-stone-600 text-xs">{memberName(task.assignee)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400">Unassigned</span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${priority.chip}`}
                  >
                    <PriorityIcon className="w-3 h-3" /> {priority.label}
                  </span>
                  {task.due_date ? (
                    <span
                      className={`text-xs ${overdue ? 'text-rose-600' : 'text-stone-500'}`}
                      title={format(new Date(task.due_date), 'PP')}
                    >
                      {format(new Date(task.due_date), 'MMM d, yy')}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-12 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${task.status === 'DONE' ? 'bg-emerald-500' : 'bg-[#00A3FF]'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] tracking-widest text-stone-400 font-mono w-8 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterMenu({
  value,
  onChange,
  members,
  currentUserId,
}: {
  value: string;
  onChange: (v: string) => void;
  members: Member[];
  currentUserId: string | null;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2.5 rounded-full bg-white border border-stone-200 text-xs text-stone-700 shadow-sm">
      <Filter className="w-3.5 h-3.5 text-stone-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs uppercase tracking-widest font-bold text-stone-700 focus:outline-none"
      >
        <option value="all">All assignees</option>
        {currentUserId && <option value="mine">My tasks</option>}
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {memberName(m)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CreateTaskModal({
  members,
  onClose,
  onCreated,
  projectId,
}: {
  members: Member[];
  onClose: () => void;
  onCreated: () => void;
  projectId: string;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignee_id: '',
    estimated_hours: '',
    due_date: '',
  });

  async function submit() {
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast({ title: 'Title must be at least 3 characters', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      await tmsApi.post(`/projects/${projectId}/tasks`, {
        title: form.title.trim(),
        description: form.description || undefined,
        priority: form.priority,
        assignee_id: form.assignee_id || undefined,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : undefined,
        due_date: form.due_date ? new Date(form.due_date + 'T12:00:00').toISOString() : undefined,
      });
      toast({ title: 'Task created' });
      onCreated();
    } catch (err: any) {
      toast({ title: 'Create failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#00A3FF] font-semibold">New task</p>
            <h3 className="text-lg font-bold text-stone-900">Drop a card on the board</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 rounded-lg p-1 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-stone-500 font-medium">
              Assignee
              <select
                value={form.assignee_id}
                onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberName(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-stone-500 font-medium">
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-stone-500 font-medium">
              Estimated hours
              <input
                type="number"
                min={0}
                step={0.25}
                value={form.estimated_hours}
                onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              />
            </label>
            <label className="text-xs text-stone-500 font-medium">
              Due date
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-stone-200 text-stone-600 text-[11px] font-bold tracking-widest uppercase hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#00A3FF] text-white text-[11px] font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-[#0090e0]"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Create task
          </button>
        </div>
      </div>
    </div>
  );
}

function AIPlanProjectModal({
  projectId,
  projectName,
  onClose,
  onApplied,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onApplied: () => void;
}) {
  const { toast } = useToast();
  const [objective, setObjective] = useState('');
  const [plan, setPlan] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);

  async function generate() {
    if (objective.trim().length < 8) {
      toast({ title: 'Describe the goal in a sentence or two', variant: 'destructive' });
      return;
    }
    setBusy(true);
    setPlan(null);
    try {
      const res = await tmsApi.post<{ data: { plan: any } }>(
        `/ai/projects/${projectId}/generate-tasks`,
        { objective: objective.trim() },
      );
      setPlan(res.data?.plan || null);
    } catch (err: any) {
      toast({ title: 'AI failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!plan) return;
    setApplying(true);
    try {
      const res = await tmsApi.post<{ data: { created_tasks: string[] } }>('/ai/plan/apply', {
        plan,
        project_id: projectId,
      });
      const count = res.data?.created_tasks?.length ?? 0;
      toast({ title: `Created ${count} tasks` });
      onApplied();
    } catch (err: any) {
      toast({ title: 'Apply failed', description: err.message, variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  }

  const phases: any[] = plan?.phases ?? [];
  const totalTasks = phases.reduce((sum, ph) => sum + (ph.tasks?.length ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-xl">
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-stone-200 bg-white/95 backdrop-blur flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-violet-700 font-semibold">AI · Plan</p>
            <h3 className="text-lg font-bold text-stone-900">Generate tasks for {projectName}</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 rounded-lg p-1 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            placeholder="What needs to happen on this project? e.g. Build the new client onboarding flow, including UI, API and automation."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={4}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
          />
          <div className="flex justify-end">
            <button
              onClick={generate}
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-600 text-white text-[11px] font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-violet-700 shadow-sm"
            >
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Draft plan
            </button>
          </div>
          {plan && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <p className="text-stone-900 text-base font-semibold">{plan.title || projectName}</p>
                <span className="text-[10px] tracking-widest text-stone-400">{totalTasks} tasks</span>
              </div>
              {plan.summary && <p className="text-xs text-stone-500">{plan.summary}</p>}
              {phases.map((phase, idx) => (
                <div key={idx} className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50/50">
                  <div className="px-4 py-2 bg-stone-100 text-[10px] uppercase tracking-widest text-stone-600 font-bold">
                    {phase.name}
                  </div>
                  <ul className="divide-y divide-stone-200 bg-white">
                    {(phase.tasks || []).map((task: any, i: number) => (
                      <li key={i} className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-900 truncate font-medium">{task.title}</span>
                          <span className="text-[10px] tracking-widest text-stone-400 inline-flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {task.estimated_hours ?? '?'}h
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPlan(null)}
                  className="px-5 py-2 rounded-full border border-stone-200 text-stone-600 text-[11px] font-bold tracking-widest uppercase hover:bg-stone-50"
                >
                  Discard
                </button>
                <button
                  onClick={apply}
                  disabled={applying}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 text-white text-[11px] font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-emerald-700 shadow-sm"
                >
                  {applying ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Apply to board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
