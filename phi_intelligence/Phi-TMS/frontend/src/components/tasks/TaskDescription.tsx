import { useState } from 'react';
import type { Task } from '../../types/task';
import { Edit2, Check, X } from 'lucide-react';

interface TaskDescriptionProps {
  task: Task;
  canEdit: boolean;
  onUpdate: (updates: Partial<Task>) => void;
}

const TaskDescription = ({ task, canEdit, onUpdate }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = () => {
    if (description !== task.description) {
      onUpdate({ description: description || undefined });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">Description</h3>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-text-muted hover:text-text-secondary"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Add a description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          {task.description ? (
            <p className="text-text-secondary whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-text-muted italic">No description provided</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDescription;






