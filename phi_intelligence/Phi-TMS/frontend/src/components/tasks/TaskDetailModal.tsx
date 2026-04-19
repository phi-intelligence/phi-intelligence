import { useState, useEffect } from 'react';
import { taskApi } from '../../services/taskApi';
import type { Task } from '../../types/task';
import LoadingSpinner from '../LoadingSpinner';
import { X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import TaskHeader from './TaskHeader';
import TaskDescription from './TaskDescription';
import TaskDetails from './TaskDetails';
import TaskComments from './TaskComments';
import TaskSidebar from './TaskSidebar';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const TaskDetailModal = ({ taskId, onClose, onUpdate }: TaskDetailModalProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';
  const isProjectManager = user?.role === 'PROJECT_MANAGER';
  const isAssignee = task?.assigneeId === user?.id;
  const isReporter = task?.reporterId === user?.id;
  const canEdit = isAdmin || isProjectManager || isAssignee || isReporter;
  const canDelete = isAdmin || isProjectManager;

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTaskById(taskId);
      setTask(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load task');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<Task>) => {
    if (!task) return;

    try {
      const updated = await taskApi.updateTask(taskId, updates);
      setTask(updated);
      if (onUpdate) onUpdate();
      toast.success('Task updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId);
      toast.success('Task deleted successfully');
      if (onUpdate) onUpdate();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await taskApi.updateTaskStatus(taskId, status);
      fetchTask();
      if (onUpdate) onUpdate();
      toast.success('Status updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await taskApi.assignTask(taskId, { assigneeId });
      fetchTask();
      if (onUpdate) onUpdate();
      toast.success('Assignee updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update assignee');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-card p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-card shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text-primary">Task Details</h2>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 transition"
                title="Delete task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <TaskHeader
              task={task}
              canEdit={canEdit}
              onUpdate={handleUpdate}
              onStatusChange={handleStatusChange}
              onAssigneeChange={handleAssigneeChange}
            />

            <TaskDescription
              task={task}
              canEdit={canEdit}
              onUpdate={handleUpdate}
            />

            <TaskDetails task={task} />

            <TaskComments
              taskId={taskId}
              onUpdate={fetchTask}
            />
          </div>

          {/* Sidebar */}
          <TaskSidebar
            task={task}
            canEdit={canEdit}
            onUpdate={handleUpdate}
            onRefresh={fetchTask}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;






