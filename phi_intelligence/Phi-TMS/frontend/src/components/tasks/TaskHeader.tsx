import { useState } from 'react';
import type { Task } from '../../types/task';
import { TaskStatus, TASK_STATUS_LABELS } from '../../types/task';
import { Priority, PRIORITY_COLORS } from '../../types/project';
import { Edit2, Check, X } from 'lucide-react';

interface TaskHeaderProps {
  task: Task;
  canEdit: boolean;
  onUpdate: (updates: Partial<Task>) => void;
  onStatusChange: (status: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
}

const TaskHeader = ({
  task,
  canEdit,
  onUpdate,
  onStatusChange,
}: TaskHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleSaveTitle = () => {
    if (title.trim() && title !== task.title) {
      onUpdate({ title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTitle(task.title);
    setIsEditingTitle(false);
  };

  const handlePriorityChange = (priority: Priority) => {
    onUpdate({ priority });
  };

  return (
    <div className="mb-6">
      {/* Title */}
      <div className="mb-4">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
              className="flex-1 text-2xl font-bold text-text-primary border-b-2 border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSaveTitle}
              className="text-green-600 hover:text-green-700"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary flex-1">
              {task.title}
            </h1>
            {canEdit && (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-text-muted hover:text-text-secondary"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status & Priority */}
      <div className="flex flex-wrap gap-3">
        {/* Status Selector */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={!canEdit}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          {Object.values(TaskStatus).map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        {/* Priority Buttons */}
        <div className="flex gap-2">
          {Object.values(Priority).map((priority) => (
            <button
              key={priority}
              onClick={() => canEdit && handlePriorityChange(priority)}
              disabled={!canEdit}
              className={`px-3 py-2 rounded text-xs font-medium transition ${
                task.priority === priority
                  ? PRIORITY_COLORS[priority]
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              } ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;






