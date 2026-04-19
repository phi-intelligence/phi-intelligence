import { useState } from 'react';
import { taskApi } from '../../services/taskApi';
import type { TaskStatus, TaskFormData } from '../../types/task';
import { Priority } from '../../types/project';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickAddTaskProps {
  projectId: string;
  defaultStatus: TaskStatus;
  onTaskCreated: () => void;
}

const QuickAddTask = ({ projectId, defaultStatus, onTaskCreated }: QuickAddTaskProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);

    try {
      const taskData: TaskFormData = {
        projectId,
        title: title.trim(),
        status: defaultStatus,
        priority: Priority.MEDIUM,
      };

      await taskApi.createTask(taskData);
      toast.success('Task created successfully');
      setTitle('');
      setIsOpen(false);
      onTaskCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-card text-text-secondary hover:border-gray-400 hover:text-text-secondary transition text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card border border-gray-300 p-3 shadow-soft">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title..."
        rows={2}
        autoFocus
        className="w-full px-2 py-1 text-sm border-none focus:outline-none resize-none"
        disabled={submitting}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary transition"
          disabled={submitting}
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="submit"
          className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={submitting || !title.trim()}
        >
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
};

export default QuickAddTask;






