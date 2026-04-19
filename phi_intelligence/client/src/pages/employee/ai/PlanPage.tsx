import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { tmsApi, unwrapTmsPaginatedList } from '@/services/tmsApi';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PlanPage() {
  const { toast } = useToast();
  const [plan, setPlan] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<{ id: string; name: string; project_code?: string }[]>([]);
  const [analyzed, setAnalyzed] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await tmsApi.get<{ data?: unknown }>(
          '/projects?status=ACTIVE&page=1&limit=100'
        );
        setProjects(unwrapTmsPaginatedList<{ id: string; name: string; project_code?: string }>(res));
      } catch {
        /* optional */
      }
    })();
  }, []);

  const handleAnalyze = async () => {
    if (!plan.trim()) {
      toast({ title: 'Enter a plan', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await tmsApi.post<{ data: any }>('/ai/plan/analyze', { plan });
      setAnalyzed(res.data);
      toast({ title: 'Plan analyzed' });
    } catch (e: any) {
      toast({
        title: 'Analysis failed',
        description: e.message || 'Check GEMINI_API_KEY on TMS',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!projectId) {
      toast({ title: 'Select a project', variant: 'destructive' });
      return;
    }
    if (!analyzed) {
      toast({ title: 'Analyze a plan first', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await tmsApi.post<{ data: { created_tasks?: string[] } }>('/ai/plan/apply', {
        plan: analyzed,
        project_id: projectId,
      });
      const n = res.data?.created_tasks?.length ?? 0;
      toast({ title: `Created ${n} task(s)` });
    } catch (e: any) {
      toast({ title: 'Apply failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#00A3FF]" />
          AI project planner
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Administrator tool — analyze a markdown plan and create tasks on a project (Phi-TMS Gemini key required)
        </p>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
        <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase">
          Plan (markdown)
        </label>
        <textarea
          className="w-full min-h-[200px] bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-900 text-sm font-mono placeholder:text-stone-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20"
          placeholder={'## Phase 1\n- Task A\n- Task B'}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !plan.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00A3FF] text-white font-semibold text-sm disabled:opacity-50 shadow-sm hover:bg-[#0090e0]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Analyze
        </button>
      </div>

      {analyzed && (
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-stone-900 font-rajdhani">{analyzed.title}</h2>
          <p className="text-stone-600 text-sm">{analyzed.summary}</p>
          {analyzed.phases?.map((phase: any, i: number) => (
            <div key={i} className="border-t border-stone-100 pt-4">
              <h3 className="font-semibold text-stone-800 mb-2">{phase.name}</h3>
              <ul className="text-sm text-stone-500 space-y-1 list-disc list-inside">
                {phase.tasks?.map((task: any, j: number) => (
                  <li key={j}>
                    {task.title} ({task.priority}, {task.estimated_hours ?? '?'}h)
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-4 border-t border-stone-100 space-y-3">
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">Apply to project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.project_code})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleApply}
                disabled={loading || !projectId}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm disabled:opacity-50 shadow-sm hover:bg-emerald-700"
              >
                Apply & create tasks
              </button>
              <Link href={projectId ? `/employee/projects/${projectId}/tasks` : '/employee/projects'}>
                <span className="inline-block px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm cursor-pointer hover:bg-stone-50 transition-colors">
                  Open task board
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
