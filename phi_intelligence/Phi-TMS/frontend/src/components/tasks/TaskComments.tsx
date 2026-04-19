import { useState } from 'react';
import { taskApi } from '../../services/taskApi';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task, TaskComment } from '../../types/task';

interface TaskCommentsProps {
  taskId: string;
  onUpdate: () => void;
}

const TaskComments = ({ taskId, onUpdate }: TaskCommentsProps) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await taskApi.addComment(taskId, { content: comment.trim() });
      setComment('');
      onUpdate();
      toast.success('Comment added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Comments</h3>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-text-primary font-medium">
                {user ? getInitials(user.profile?.firstName || 'U', user.profile?.lastName || 'U') : 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              disabled={submitting}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!comment.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List - Placeholder */}
      <div className="space-y-4">
        <p className="text-sm text-text-muted italic">
          Comments will appear here once the backend integration is complete
        </p>
      </div>
    </div>
  );
};

export default TaskComments;






