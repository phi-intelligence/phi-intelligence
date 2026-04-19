import { useState } from 'react';
import type { Task } from '../../types/task';
import { TASK_STATUS_LABELS, TaskStatus } from '../../types/task';
import { PRIORITY_COLORS } from '../../types/project';
import { taskApi } from '../../services/taskApi';
import { CheckCircle, Circle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

interface TaskListItemProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  onUpdate: () => void;
  showProject?: boolean;
}

const TaskListItem = ({ task, onTaskClick, onUpdate, showProject = true }: TaskListItemProps) => {
  const [updating, setUpdating] = useState(false);

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
  const isDone = task.status === 'DONE';

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setUpdating(true);
    try {
      const newStatus = isDone ? TaskStatus.TODO : TaskStatus.DONE;
      await taskApi.updateTaskStatus(task.id, newStatus);
      toast.success(isDone ? 'Task reopened' : 'Task completed');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    
    setUpdating(true);
    try {
      await taskApi.updateTaskStatus(task.id, e.target.value);
      toast.success('Status updated');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      onClick={() => onTaskClick(task.id)}
      className={`flex items-center gap-4 p-4 bg-white rounded-card border-0 hover:shadow-soft-lg transition cursor-pointer ${
        isDone ? 'opacity-60' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        disabled={updating}
        className="flex-shrink-0 text-text-muted hover:text-green-600 transition disabled:opacity-50"
      >
        {isDone ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Priority Badge */}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>

          {/* Project Name (if shown) */}
          {showProject && (
            <span className="text-xs text-text-muted truncate">
              {task.project?.name || 'No Project'}
            </span>
          )}
        </div>

        {/* Task Title */}
        <h4 className={`text-sm font-medium mb-1 ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </h4>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-text-muted'}`}>
            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
            {isOverdue && ' • Overdue'}
          </div>
        )}
      </div>

      {/* Status Dropdown */}
      <div className="flex-shrink-0">
        <select
          value={task.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          disabled={updating}
          className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          {Object.values(TaskStatus).map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskListItem;






