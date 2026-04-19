import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { tmsApi, unwrapTmsPaginatedList } from '@/services/tmsApi';
import { FolderKanban, CheckSquare, Users, Loader2, Plus } from 'lucide-react';
import { useEmployee } from '@/contexts/EmployeeContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ProjectList() {
  const { toast } = useToast();
  const { user } = useEmployee();
  const canCreateProject = user?.role === 'ADMIN';
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const query =
        filter === 'ALL'
          ? '/projects?page=1&limit=50'
          : `/projects?status=${filter}&page=1&limit=50`;
      const response = await tmsApi.get<{ data?: unknown }>(query);
      setProjects(unwrapTmsPaginatedList<any>(response));
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ON_HOLD': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'COMPLETED': return 'text-[#00A3FF] bg-[#EBF5FF] border-[#00A3FF]/20';
      default: return 'text-stone-500 bg-stone-50 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">Projects</h1>
          <p className="text-stone-500 mt-1 text-sm">View and manage your assigned projects</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {canCreateProject && (
            <Link href="/employee/projects/new">
              <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#00A3FF] text-white font-semibold text-xs tracking-widest uppercase cursor-pointer hover:bg-[#0090e0] shadow-sm transition-colors">
                <Plus className="w-4 h-4" />
                New project
              </span>
            </Link>
          )}
          <div className="bg-white border border-stone-200 shadow-sm p-1.5 rounded-xl flex gap-1">
            {['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ALL'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all ${
                  filter === status
                    ? 'bg-[#00A3FF] text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-xl font-bold text-stone-900 mb-2 font-rajdhani tracking-widest uppercase">No Projects Found</h3>
          <p className="text-stone-400">You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} projects at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const taskCount = project._count?.tasks ?? project.taskCount ?? 0;
            const memberCount = project._count?.members ?? project.memberCount ?? 0;
            const endDateRaw = project.end_date ?? project.endDate;
            return (
            <Link key={project.id} href={`/employee/projects/${project.id}`}>
              <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 hover:border-[#00A3FF]/30 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#00A3FF] transition-colors line-clamp-1">{project.name}</h3>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border flex-shrink-0 ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-stone-500 mb-6 line-clamp-2 flex-1">{project.description}</p>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                  {typeof project.progress === 'number' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-stone-400 font-semibold uppercase tracking-widest">
                        <span>Progress</span>
                        <span className="text-[#00A3FF]">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00A3FF] rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-medium text-stone-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-stone-300" />
                        <span>{taskCount} tasks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-stone-300" />
                        <span>{memberCount} members</span>
                      </div>
                    </div>
                  </div>

                  {endDateRaw && (
                    <div className="text-xs text-stone-400 pt-2 flex items-center justify-between">
                      <span className="uppercase tracking-widest font-semibold text-[10px]">Due Date</span>
                      <span className={new Date(endDateRaw) < new Date() && project.status !== 'COMPLETED' ? 'text-red-500' : 'text-stone-600'}>
                        {format(new Date(endDateRaw), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
