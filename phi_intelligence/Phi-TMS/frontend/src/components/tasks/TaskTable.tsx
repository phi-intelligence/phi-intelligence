import type { Task, TaskStatus } from '../../types/task';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../types/task';
import { Priority, PRIORITY_COLORS } from '../../types/project';
import { formatDate } from '../../utils/formatters';
import { Clock } from 'lucide-react';
import QuickAddTask from './QuickAddTask';

interface TaskTableProps {
  tasks: Task[];
  projectId?: string;
  onOpenTask: (taskId: string) => void;
  onLogTime?: (taskId: string) => void;
  onTaskCreated: () => void;
}

const LABEL_COLORS = ['bg-emerald-100 text-emerald-800', 'bg-blue-100 text-blue-800', 'bg-violet-100 text-violet-800', 'bg-amber-100 text-amber-800'];

const TaskTable = ({ tasks, projectId, onOpenTask, onLogTime, onTaskCreated }: TaskTableProps) => {
  const getLabelColor = (index: number) => LABEL_COLORS[index % LABEL_COLORS.length];

  const assigneeDisplay = (task: Task) => {
    if (!task.assignee) return <span className="text-text-muted">Unassigned</span>;
    const name = [task.assignee.firstName, task.assignee.lastName].filter(Boolean).join(' ') || task.assignee.email;
    return <span className="text-text-primary">{name}</span>;
  };

  const labels = (task: Task) => {
    const items = [...(task.labels || []), ...(task.tags || [])].filter(Boolean).slice(0, 4);
    if (items.length === 0) return <span className="text-text-muted">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((label, i) => (
          <span
            key={`${task.id}-${i}-${label}`}
            className={`px-2 py-0.5 rounded text-xs font-medium ${getLabelColor(i)}`}
          >
            {label}
          </span>
        ))}
      </div>
    );
  };

  const priorityDisplay = (priority: Priority) => {
    if (!priority) return <span className="text-text-muted">—</span>;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="border border-gray-200 rounded-card overflow-hidden bg-white flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Labels</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Title</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Priority</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Due date</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Assignee</th>
                {onLogTime && <th className="px-4 py-3 font-medium text-text-secondary w-24">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={onLogTime ? 7 : 6} className="px-4 py-12 text-center text-text-muted">
                    No tasks. Add one below.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onOpenTask(task.id)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">{labels(task)}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{task.title}</td>
                    <td className="px-4 py-3">{priorityDisplay(task.priority)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${TASK_STATUS_COLORS[task.status as TaskStatus]}`}>
                        {TASK_STATUS_LABELS[task.status as TaskStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {task.dueDate ? formatDate(task.dueDate, 'EEE, MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">{assigneeDisplay(task)}</td>
                    {onLogTime && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onLogTime(task.id)}
                          className="p-1.5 rounded hover:bg-gray-200 text-text-secondary hover:text-text-primary"
                          title="Log time"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {projectId && (
        <div className="mt-3 max-w-xs">
          <QuickAddTask
            projectId={projectId}
            defaultStatus="TODO"
            onTaskCreated={onTaskCreated}
          />
        </div>
      )}
    </div>
  );
};

export default TaskTable;
