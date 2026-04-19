import type { Task } from '../../types/task';
import { User, Calendar, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TaskDetailsProps {
  task: Task;
}

const TaskDetails = ({ task }: TaskDetailsProps) => {
  const formatDate = (date: string): string => {
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  };

  const formatRelativeTime = (date: string): string => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-3">Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-card">
        {/* Reporter */}
        <div className="flex items-start gap-3">
          <div className="bg-purple-50 p-2 rounded">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Reporter</div>
            <div className="text-sm font-medium text-text-primary">
              {task.reporter
                ? `${task.reporter.firstName} ${task.reporter.lastName}`
                : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 p-2 rounded">
            <Calendar className="w-4 h-4 text-text-primary" />
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Created</div>
            <div className="text-sm font-medium text-text-primary">
              {formatDate(task.createdAt)}
            </div>
          </div>
        </div>

        {/* Updated Date */}
        <div className="flex items-start gap-3">
          <div className="bg-green-50 p-2 rounded">
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Updated</div>
            <div className="text-sm font-medium text-text-primary">
              {formatRelativeTime(task.updatedAt)}
            </div>
          </div>
        </div>

        {/* Completed Date */}
        {task.completedDate && (
          <div className="flex items-start gap-3">
            <div className="bg-teal-50 p-2 rounded">
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Completed</div>
              <div className="text-sm font-medium text-text-primary">
                {formatDate(task.completedDate)}
              </div>
            </div>
          </div>
        )}

        {/* Parent Task */}
        {task.parentTask && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="bg-orange-50 p-2 rounded">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Parent Task</div>
              <div className="text-sm font-medium text-text-primary hover:text-text-primary cursor-pointer">
                {task.parentTask.title}
              </div>
            </div>
          </div>
        )}

        {/* Estimated vs Actual Hours */}
        {(task.estimatedHours || task.actualHours) && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="bg-indigo-50 p-2 rounded">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Time Tracking</div>
              <div className="text-sm font-medium text-text-primary">
                {task.actualHours || 0}h logged
                {task.estimatedHours && ` / ${task.estimatedHours}h estimated`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;






