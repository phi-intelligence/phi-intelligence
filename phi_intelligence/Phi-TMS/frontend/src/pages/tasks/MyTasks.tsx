import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../services/taskApi';
import type { Task } from '../../types/task';
import { TaskStatus } from '../../types/task';
import LoadingSpinner from '../../components/LoadingSpinner';
import TaskListItem from '../../components/tasks/TaskListItem';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import { LayoutList, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { isToday, isThisWeek, isPast } from 'date-fns';
import toast from 'react-hot-toast';

type GroupByType = 'project' | 'status';
type FilterType = 'all' | 'today' | 'week' | 'overdue';

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupByType>('project');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getMyTasks();
      setTasks(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = (): Task[] => {
    let filtered = [...tasks];

    switch (filter) {
      case 'today':
        filtered = filtered.filter(
          (task) => task.dueDate && isToday(new Date(task.dueDate))
        );
        break;
      case 'week':
        filtered = filtered.filter(
          (task) => task.dueDate && isThisWeek(new Date(task.dueDate))
        );
        break;
      case 'overdue':
        filtered = filtered.filter(
          (task) =>
            task.dueDate &&
            isPast(new Date(task.dueDate)) &&
            task.status !== TaskStatus.DONE
        );
        break;
    }

    return filtered;
  };

  const getGroupedTasks = () => {
    const filtered = getFilteredTasks();

    if (groupBy === 'project') {
      const grouped: Record<string, Task[]> = {};
      filtered.forEach((task) => {
        const projectName = task.project?.name || 'No Project';
        if (!grouped[projectName]) {
          grouped[projectName] = [];
        }
        grouped[projectName].push(task);
      });

      // Sort tasks within each project by priority and due date
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          
          if (aPriority !== bPriority) return aPriority - bPriority;
          
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          
          return 0;
        });
      });

      return grouped;
    } else {
      const grouped: Record<string, Task[]> = {};
      filtered.forEach((task) => {
        const status = task.status;
        if (!grouped[status]) {
          grouped[status] = [];
        }
        grouped[status].push(task);
      });

      return grouped;
    }
  };

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  const groupedTasks = getGroupedTasks();
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Tasks</h1>
        <p className="text-text-secondary mt-1">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('project')}
            className={`flex items-center gap-2 px-4 py-2 rounded-card transition ${
              groupBy === 'project'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-text-secondary border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            By Project
          </button>
          <button
            onClick={() => setGroupBy('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-card transition ${
              groupBy === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-text-secondary border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            By Status
          </button>
        </div>

        {/* Filter Dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="px-4 py-2 border border-gray-300 rounded-card focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          <option value="today">Due Today</option>
          <option value="week">Due This Week</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Task Groups */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="bg-white rounded-card shadow-soft border-0 p-12 text-center">
          <div className="text-text-muted text-5xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No tasks found</h3>
          <p className="text-text-secondary mb-4">
            {filter !== 'all'
              ? 'Try changing your filter to see more tasks'
              : 'You have no tasks assigned at the moment'}
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition"
          >
            Browse Projects
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
            const isCollapsed = collapsedGroups.has(groupName);

            return (
              <div key={groupName} className="bg-white rounded-card shadow-soft border-0 overflow-hidden">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                    <h2 className="text-lg font-semibold text-text-primary">{groupName}</h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {groupTasks.length}
                    </span>
                  </div>
                </button>

                {/* Group Tasks */}
                {!isCollapsed && (
                  <div className="p-4 space-y-3">
                    {groupTasks.map((task) => (
                      <TaskListItem
                        key={task.id}
                        task={task}
                        onTaskClick={setSelectedTaskId}
                        onUpdate={fetchTasks}
                        showProject={groupBy !== 'project'}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
};

export default MyTasks;





