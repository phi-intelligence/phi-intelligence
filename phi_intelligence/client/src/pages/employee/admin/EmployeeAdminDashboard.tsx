import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Palmtree,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { tmsApi, unwrapTmsPaginatedList } from '@/services/tmsApi';
import { useToast } from '@/hooks/use-toast';

type ClockedIn = { user_id: string; name: string; clock_in: string | null };
type FinishedToday = { user_id: string; name: string; hours: number; clock_out: string | null };

type ProjectProgress = {
  id: string;
  name: string;
  status: string;
  lead: { id: string; name: string } | null;
  members: number;
  task_counts: {
    total: number;
    todo: number;
    in_progress: number;
    in_review: number;
    blocked: number;
    done: number;
  };
  estimated_hours: number;
  actual_hours: number;
  progress_percent: number;
};

type CompletedRecent = {
  id: string;
  title: string;
  project: { id: string; name: string } | null;
  assignee: { id: string; name: string } | null;
  completed_at: string | null;
  actual_hours: number;
};

type LiveDashboard = {
  generated_at: string;
  workforce: {
    clocked_in: ClockedIn[];
    finished_today: FinishedToday[];
    clocked_in_count: number;
    total_hours_today: number;
  };
  projects: ProjectProgress[];
  completed_recent: CompletedRecent[];
};

type StatsDashboard = {
  total_employees?: number;
  on_leave_today?: number;
  pending_leave_requests?: number;
  monthly_attendance?: { total_records?: number; total_hours?: number; overtime_hours?: number };
};

type Insights = {
  insights: {
    headline: string;
    highlights: string[];
    risks: string[];
    next_actions: string[];
  };
  source: string;
};

export default function EmployeeAdminDashboard() {
  const { toast } = useToast();
  const [live, setLive] = useState<LiveDashboard | null>(null);
  const [stats, setStats] = useState<StatsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [liveRes, statsRes] = await Promise.all([
        tmsApi.get<{ data: LiveDashboard }>('/admin/dashboard/live'),
        tmsApi.get<{ data: StatsDashboard }>('/admin/dashboard'),
      ]);
      setLive(liveRes.data || null);
      setStats(statsRes.data || null);
    } catch (err: any) {
      toast({ title: 'Failed to load dashboard', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadInsights = useCallback(async () => {
    try {
      setInsightsLoading(true);
      const res = await tmsApi.get<{ data: Insights }>('/ai/admin/insights');
      setInsights(res.data || null);
    } catch (err: any) {
      toast({
        title: 'AI insights unavailable',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setInsightsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
    loadInsights();
  }, [loadAll, loadInsights]);

  const headerCards = useMemo(() => {
    const workforce = live?.workforce;
    const monthly = stats?.monthly_attendance;
    return [
      {
        label: 'Working now',
        value: workforce?.clocked_in_count ?? 0,
        icon: UserCheck,
        tone: 'text-emerald-600',
        sub: workforce ? `${workforce.total_hours_today.toFixed(1)}h logged today` : undefined,
      },
      {
        label: 'Active employees',
        value: stats?.total_employees ?? 0,
        icon: Users,
        tone: 'text-[#00A3FF]',
        sub: stats?.on_leave_today != null ? `${stats.on_leave_today} on leave` : undefined,
      },
      {
        label: 'Pending requests',
        value: stats?.pending_leave_requests ?? 0,
        icon: Palmtree,
        tone: 'text-amber-600',
        sub: 'Leave approvals waiting',
      },
      {
        label: 'Hours this month',
        value: monthly?.total_hours ? Number(monthly.total_hours).toFixed(0) : 0,
        icon: TrendingUp,
        tone: 'text-violet-600',
        sub: monthly?.overtime_hours != null ? `${Number(monthly.overtime_hours).toFixed(1)}h overtime` : undefined,
      },
    ];
  }, [live, stats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#00A3FF] mb-1">Operations</p>
          <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">
            Command Centre
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            {live ? `Updated ${format(new Date(live.generated_at), 'EEE HH:mm')}` : 'Workforce overview'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { loadAll(); loadInsights(); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A3FF] text-white text-xs font-semibold tracking-wider uppercase shadow-sm hover:bg-[#0090e0] transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" /> AI · Plan Tasks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {headerCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl bg-stone-50 ${card.tone}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-stone-400">{card.label}</p>
              <p className="text-2xl font-bold text-stone-900 font-rajdhani mt-0.5">{card.value}</p>
              {card.sub && <p className="text-xs text-stone-400 mt-0.5 truncate">{card.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AIInsightsCard
          insights={insights}
          loading={insightsLoading}
          onRefresh={loadInsights}
        />
        <WorkingNowCard live={live} />
      </div>

      <ProjectGrid projects={live?.projects ?? []} />

      <CompletedTodayPanel completed={live?.completed_recent ?? []} />

      {showGenerator && (
        <AITaskGenerator
          projects={live?.projects ?? []}
          onClose={() => setShowGenerator(false)}
          onApplied={() => {
            setShowGenerator(false);
            loadAll();
            loadInsights();
          }}
        />
      )}
    </div>
  );
}

function AIInsightsCard({
  insights,
  loading,
  onRefresh,
}: {
  insights: Insights | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="xl:col-span-2 bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-blue-50 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00A3FF]" />
          <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-800">AI Briefing</h2>
          {insights?.source === 'fallback' && (
            <span className="text-[10px] uppercase tracking-widest text-amber-500">Fallback</span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs font-semibold tracking-widest uppercase text-stone-400 hover:text-stone-700 inline-flex items-center gap-1.5 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
          Regenerate
        </button>
      </div>
      <div className="p-6 space-y-4">
        {!insights ? (
          <p className="text-sm text-stone-400">Generating insights…</p>
        ) : (
          <>
            <p className="text-base text-stone-800 leading-snug font-medium">{insights.insights.headline}</p>
            {insights.insights.highlights.length > 0 && (
              <Section title="Highlights" tone="emerald" items={insights.insights.highlights} />
            )}
            {insights.insights.risks.length > 0 && (
              <Section title="Risks" tone="rose" items={insights.insights.risks} />
            )}
            {insights.insights.next_actions.length > 0 && (
              <Section title="Suggested next actions" tone="phi" items={insights.insights.next_actions} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'emerald' | 'rose' | 'phi';
}) {
  const dot =
    tone === 'emerald' ? 'bg-emerald-500' : tone === 'rose' ? 'bg-red-500' : 'bg-[#00A3FF]';
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-stone-700">
            <span className={`mt-2 w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkingNowCard({ live }: { live: LiveDashboard | null }) {
  const clocked = live?.workforce.clocked_in ?? [];
  const finished = live?.workforce.finished_today ?? [];
  return (
    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-800">Working Now</h2>
        </div>
        <span className="text-xs tracking-widest text-stone-400">{clocked.length} live</span>
      </div>
      <div className="divide-y divide-stone-100 max-h-[420px] overflow-y-auto">
        {clocked.length === 0 ? (
          <p className="px-6 py-8 text-sm text-stone-400">No one is clocked in right now.</p>
        ) : (
          clocked.map((p) => (
            <div key={p.user_id} className="px-6 py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-stone-900">{p.name}</span>
              </div>
              <span className="text-xs text-stone-400">
                {p.clock_in ? `since ${format(new Date(p.clock_in), 'HH:mm')}` : ''}
              </span>
            </div>
          ))
        )}
        {finished.length > 0 && (
          <div className="px-6 py-3 bg-stone-50">
            <p className="text-[10px] uppercase tracking-widest text-stone-400">
              Finished today · {finished.length}
            </p>
          </div>
        )}
        {finished.map((p) => (
          <div key={p.user_id + 'f'} className="px-6 py-3 flex items-center justify-between text-sm">
            <span className="text-stone-600">{p.name}</span>
            <span className="text-xs text-stone-400">{p.hours.toFixed(1)}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectGrid({ projects }: { projects: ProjectProgress[] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-8 text-center text-stone-400">
        No active projects. Create one from the Projects tab to get started.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-700">Project Progress</h2>
        <Link href="/employee/projects">
          <span className="text-xs tracking-wider text-[#00A3FF] cursor-pointer hover:text-[#0090e0] inline-flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/employee/projects/${project.id}`}>
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5 hover:border-[#00A3FF]/30 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-[#00A3FF]">{project.status}</p>
                  <h3 className="text-base font-semibold text-stone-900 truncate group-hover:text-[#00A3FF] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Lead: {project.lead?.name || '—'} · Team: {project.members}
                  </p>
                </div>
                <span className="text-2xl font-bold text-stone-900 font-rajdhani">
                  {project.progress_percent}%
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[#00A3FF] to-violet-400"
                  style={{ width: `${project.progress_percent}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <Pill label="To do" value={project.task_counts.todo} />
                <Pill label="Doing" value={project.task_counts.in_progress} tone="amber" />
                <Pill label="Done" value={project.task_counts.done} tone="emerald" />
                <Pill label="Blocked" value={project.task_counts.blocked} tone="rose" />
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs tracking-wide text-stone-400">
                <span>{project.actual_hours.toFixed(1)}h logged</span>
                <span>{project.estimated_hours.toFixed(1)}h planned</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Pill({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'amber' | 'emerald' | 'rose' }) {
  const colors = {
    default: 'text-stone-600 bg-stone-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-red-600 bg-red-50',
  } as const;
  return (
    <div className={`rounded-lg py-2 ${colors[tone]}`}>
      <div className="text-base font-bold">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-stone-400">{label}</div>
    </div>
  );
}

function CompletedTodayPanel({ completed }: { completed: CompletedRecent[] }) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-800">Recently Completed</h2>
        <span className="ml-auto text-xs text-stone-400">last 24h</span>
      </div>
      {completed.length === 0 ? (
        <p className="px-6 py-8 text-sm text-stone-400">Nothing closed in the last 24 hours.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {completed.map((task) => (
            <li key={task.id} className="px-6 py-3 flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="text-stone-900 truncate font-medium">{task.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {task.project?.name || '—'} · {task.assignee?.name || 'Unassigned'}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xs text-stone-500">{task.actual_hours.toFixed(1)}h</p>
                <p className="text-[10px] text-stone-400">
                  {task.completed_at ? formatDistanceToNow(new Date(task.completed_at), { addSuffix: true }) : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AITaskGenerator({
  projects,
  onClose,
  onApplied,
}: {
  projects: ProjectProgress[];
  onClose: () => void;
  onApplied: () => void;
}) {
  const { toast } = useToast();
  const [allProjects, setAllProjects] = useState<{ id: string; name: string }[]>(
    projects.map((p) => ({ id: p.id, name: p.name })),
  );
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? '');
  const [objective, setObjective] = useState('');
  const [plan, setPlan] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    // Make sure the picker has every project, not just the ones on the live snapshot.
    (async () => {
      try {
        const res = await tmsApi.get<{ data?: unknown }>('/projects?status=ACTIVE&page=1&limit=200');
        const list = unwrapTmsPaginatedList<{ id: string; name: string }>(res);
        if (list.length) {
          setAllProjects(list.map((p) => ({ id: p.id, name: p.name })));
          if (!projectId && list[0]) setProjectId(list[0].id);
        }
      } catch {
        // no-op; fall back to snapshot list
      }
    })();
  }, []);

  async function generate() {
    if (!projectId) {
      toast({ title: 'Pick a project first', variant: 'destructive' });
      return;
    }
    if (objective.trim().length < 8) {
      toast({ title: 'Describe the objective in a sentence or two', variant: 'destructive' });
      return;
    }
    setGenerating(true);
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
      setGenerating(false);
    }
  }

  async function apply() {
    if (!plan || !projectId) return;
    setApplying(true);
    try {
      const res = await tmsApi.post<{ data: { created_tasks: string[] } }>('/ai/plan/apply', {
        plan,
        project_id: projectId,
      });
      const count = res.data?.created_tasks?.length ?? 0;
      toast({ title: `Created ${count} tasks on the board.` });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-stone-200 shadow-2xl rounded-2xl">
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#00A3FF]">AI · Task generator</p>
            <h3 className="text-base font-bold text-stone-900">Plan a sprint with one prompt</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="sm:col-span-1 block text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Project
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2 text-xs text-stone-400 self-end pb-1">
              Tasks are drafted only; nothing hits the board until you press <span className="text-stone-700 font-medium">Apply</span>.
            </div>
          </div>
          <textarea
            placeholder="e.g. Ship the new onboarding flow next sprint: design, API, mobile UI, QA, launch checklist."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={4}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={generate}
              disabled={generating || !projectId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A3FF] text-white text-xs font-semibold tracking-wider uppercase disabled:opacity-50 shadow-sm hover:bg-[#0090e0]"
            >
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generate
            </button>
          </div>

          {plan && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-900 text-sm font-semibold">{plan.title || 'Plan preview'}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{plan.summary}</p>
                </div>
                <span className="text-xs text-stone-400">{totalTasks} tasks</span>
              </div>
              {phases.map((phase, idx) => (
                <div key={idx} className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="px-4 py-2 bg-stone-50 text-xs uppercase tracking-widest text-stone-600 font-semibold">
                    {phase.name}
                  </div>
                  <ul className="divide-y divide-stone-100">
                    {(phase.tasks || []).map((task: any, i: number) => (
                      <li key={i} className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-stone-900 truncate">{task.title}</p>
                          <span className="text-xs text-stone-400">
                            {task.priority} · {task.estimated_hours ?? '?'}h
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
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-wider hover:bg-stone-50"
                >
                  Discard
                </button>
                <button
                  onClick={apply}
                  disabled={applying}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold tracking-wider uppercase disabled:opacity-50 shadow-sm hover:bg-emerald-700"
                >
                  {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
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
