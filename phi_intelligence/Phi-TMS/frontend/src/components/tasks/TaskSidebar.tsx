import { useState } from 'react';
import type { Task } from '../../types/task';
import { Calendar, Clock, Tag, Users } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { api } from '../../services/api';
import { useEffect } from 'react';
import type { User } from '../../types/project';

interface TaskSidebarProps {
  task: Task;
  canEdit: boolean;
  onUpdate: (updates: Partial<Task>) => void;
  onRefresh: () => void;
}

const TaskSidebar = ({ task, canEdit, onUpdate }: TaskSidebarProps) => {
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ assigneeId: e.target.value || undefined });
  };

  const handleDateChange = (field: 'startDate' | 'dueDate', value: string) => {
    onUpdate({ [field]: value || undefined });
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

  const getInitials = (user: User): string => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto bg-gray-50">
      {/* Assignee */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          <Users className="w-4 h-4" />
          Assignee
        </label>
        <select
          value={task.assigneeId || ''}
          onChange={handleAssigneeChange}
          disabled={!canEdit}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Unassigned</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
        {task.assignee && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded border-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-text-primary font-medium">
                {getInitials(task.assignee)}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">
                {task.assignee.firstName} {task.assignee.lastName}
              </div>
              <div className="text-xs text-text-muted">{task.assignee.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          <Calendar className="w-4 h-4" />
          Start Date
        </label>
        <input
          type="date"
          value={task.startDate ? task.startDate.split('T')[0] : ''}
          onChange={(e) => handleDateChange('startDate', e.target.value)}
          disabled={!canEdit}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          <Calendar className="w-4 h-4" />
          Due Date
        </label>
        <input
          type="date"
          value={task.dueDate ? task.dueDate.split('T')[0] : ''}
          onChange={(e) => handleDateChange('dueDate', e.target.value)}
          disabled={!canEdit}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {isOverdue && (
          <p className="text-xs text-red-600 mt-1">This task is overdue</p>
        )}
      </div>

      {/* Time Tracking */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Clock className="w-4 h-4" />
            Time Tracking
          </label>
        </div>
        <div className="bg-white p-3 rounded border-0">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Logged:</span>
            <span className="font-medium text-text-primary">{task.actualHours || 0}h</span>
          </div>
          {task.estimatedHours && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Estimated:</span>
              <span className="font-medium text-text-primary">{task.estimatedHours}h</span>
            </div>
          )}
          <button
            onClick={() => {
              // Trigger time log modal event
              const event = new CustomEvent('openTimeLogModal', {
                detail: { projectId: task.projectId, taskId: task.id },
              });
              window.dispatchEvent(event);
            }}
            className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            Log Time
          </button>
        </div>
      </div>

      {/* Labels/Tags */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          <Tag className="w-4 h-4" />
          Labels
        </label>
        <div className="flex flex-wrap gap-2">
          {task.labels && task.labels.length > 0 ? (
            task.labels.map((label, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {label}
              </span>
            ))
          ) : (
            <p className="text-sm text-text-muted italic">No labels</p>
          )}
        </div>
      </div>

      {/* Subtasks Count */}
      {task._count?.subTasks && task._count.subTasks > 0 && (
        <div className="mb-6">
          <div className="bg-white p-3 rounded border-0">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtasks:</span>
              <span className="font-medium text-text-primary">{task._count.subTasks}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSidebar;

