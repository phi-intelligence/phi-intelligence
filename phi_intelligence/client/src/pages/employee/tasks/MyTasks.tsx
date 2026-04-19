import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { tmsApi } from '@/services/tmsApi';
import { LayoutList, Layers, ChevronDown, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { isToday, isThisWeek, isPast, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useEmployee } from '@/contexts/EmployeeContext';
import TaskDetailModal from '@/components/employee/TaskDetailModal';
import { TaskStatusPill } from '@/components/employee/taskStatusUi';

type GroupByType = 'project' | 'status';
type FilterType = 'all' | 'today' | 'week' | 'overdue';

export default function MyTasks() {
  const { user } = useEmployee();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupByType>('project');
  const [filter, setFilter] = useState<FilterType>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeTask, setActiveTask] = useState<any | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tmsApi.get<{data: any[]}>('/tasks/my-tasks');
      setTasks(response.data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = (): any[] => {
    let filtered = [...tasks];

    switch (filter) {
      case 'today':
        filtered = filtered.filter((task) => task.due_date && isToday(new Date(task.due_date)));
        break;
      case 'week':
        filtered = filtered.filter((task) => task.due_date && isThisWeek(new Date(task.due_date)));
        break;
      case 'overdue':
        filtered = filtered.filter((task) => task.due_date && isPast(new Date(task.due_date)) && task.status !== 'DONE');
        break;
    }

    return filtered;
  };

  const getGroupedTasks = () => {
    const filtered = getFilteredTasks();
    const grouped: Record<string, any[]> = {};

    if (groupBy === 'project') {
      filtered.forEach((task) => {
        const projectName = task.project?.name || 'No Project';
        if (!grouped[projectName]) grouped[projectName] = [];
        grouped[projectName].push(task);
      });

      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          const aPriority = priorityOrder[a.priority] ?? 4;
          const bPriority = priorityOrder[b.priority] ?? 4;

          if (aPriority !== bPriority) return aPriority - bPriority;
          if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          return 0;
        });
      });
    } else {
      filtered.forEach((task) => {
        const status = task.status || 'UNKNOWN';
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(task);
      });
    }

    return grouped;
  };

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) newCollapsed.delete(groupName);
    else newCollapsed.add(groupName);
    setCollapsedGroups(newCollapsed);
  };

  const canChangeStatusForTask = (task: any) =>
    user?.role === 'ADMIN' ||
    task?.assignee_id === user?.id ||
    (!!task?.project?.project_lead_id && task.project.project_lead_id === user?.id);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await tmsApi.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
      toast({ title: "Task status updated" });
    } catch(err: any) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const groupedTasks = getGroupedTasks();
  const filteredTasks = getFilteredTasks();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-stone-500 bg-stone-50 border-stone-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">My Tasks</h1>
        <p className="text-stone-500 mt-1 text-sm">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-stone-200 shadow-sm p-4 rounded-2xl">
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('project')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-xs font-semibold tracking-widest uppercase border ${
              groupBy === 'project'
                ? 'bg-[#EBF5FF] text-[#00A3FF] border-[#00A3FF]/20'
                : 'bg-stone-50 text-stone-500 hover:text-stone-900 border-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            By Project
          </button>
          <button
            onClick={() => setGroupBy('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-xs font-semibold tracking-widest uppercase border ${
              groupBy === 'status'
                ? 'bg-[#EBF5FF] text-[#00A3FF] border-[#00A3FF]/20'
                : 'bg-stone-50 text-stone-500 hover:text-stone-900 border-stone-200'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            By Status
          </button>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold tracking-widest uppercase rounded-lg px-4 py-2 focus:outline-none focus:border-[#00A3FF]"
        >
          <option value="all">All Tasks</option>
          <option value="today">Due Today</option>
          <option value="week">Due This Week</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {Object.keys(groupedTasks).length === 0 ? (
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center">
          <div className="text-5xl mb-6 opacity-30">✅</div>
          <h3 className="text-xl font-bold text-stone-900 mb-2 font-rajdhani tracking-widest uppercase">No tasks found</h3>
          <p className="text-stone-400 mb-8">
            {filter !== 'all' ? 'Try changing your filter to see more tasks' : 'You have no tasks assigned at the moment'}
          </p>
          <Link href="/employee/projects">
            <button className="px-5 py-2.5 bg-[#00A3FF] hover:bg-[#0090e0] text-white font-semibold tracking-wider uppercase rounded-lg transition-all shadow-sm text-sm">
              Browse Projects
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
            const isCollapsed = collapsedGroups.has(groupName);

            return (
              <div key={groupName} className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between p-5 bg-stone-50 hover:bg-stone-100 transition-colors border-b border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? <ChevronRight className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                    <h2 className="text-base font-bold text-stone-800 tracking-wide">{groupName.replace(/_/g, ' ')}</h2>
                    <span className="px-2.5 py-0.5 bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20 rounded-full text-xs font-bold">
                      {groupTasks.length}
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-stone-100">
                    {groupTasks.map((task) => {
                      const estimated = Number(task.estimated_hours) || 0;
                      const actual = Number(task.actual_hours) || 0;
                      const percent =
                        estimated > 0
                          ? Math.min(100, Math.round((actual / estimated) * 100))
                          : task.status === 'DONE'
                            ? 100
                            : 0;
                      return (
                      <div key={task.id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between hover:bg-stone-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setActiveTask(task)}
                            className="text-left w-full"
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <h4 className="font-semibold text-stone-900 text-base hover:text-[#00A3FF] transition-colors">{task.title}</h4>
                              <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-sm text-stone-500 line-clamp-2 mb-3">{task.description}</p>
                          </button>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-400">
                            {task.due_date && (
                              <div className={`flex items-center gap-1.5 ${isPast(new Date(task.due_date)) && task.status !== 'DONE' ? 'text-red-500' : ''}`}>
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </div>
                            )}
                            {groupBy !== 'project' && task.project?.name && (
                              <div className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                {task.project.name}
                              </div>
                            )}
                            <div className="flex items-center gap-2 min-w-[140px] flex-1 max-w-xs">
                              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00A3FF]" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-[10px] tracking-widest text-stone-400 font-bold">{percent}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:min-w-[160px] shrink-0 items-end sm:items-stretch">
                          {canChangeStatusForTask(task) ? (
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="bg-stone-50 border border-stone-200 text-stone-700 text-[10px] font-bold tracking-widest uppercase rounded-lg px-3 py-2 w-full outline-none focus:border-[#00A3FF]"
                          >
                            <option value="BACKLOG">Backlog</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="BLOCKED">Blocked</option>
                            <option value="DONE">Done</option>
                          </select>
                          ) : (
                            <div className="flex justify-end w-full">
                              <TaskStatusPill status={task.status} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveTask(task)}
                            className="text-[10px] font-semibold tracking-widest uppercase text-[#00A3FF] hover:bg-[#EBF5FF] px-3 py-2 rounded-lg border border-[#00A3FF]/20 transition-colors"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TaskDetailModal task={activeTask} onClose={() => setActiveTask(null)} onChanged={fetchTasks} />
    </div>
  );
}
