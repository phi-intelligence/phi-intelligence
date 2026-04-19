import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import { PRIORITY_COLORS } from '../../types/project';
import { Paperclip, MessageCircle, CheckSquare, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

  const handleClick = (e: React.MouseEvent) => {
    // Prevent drag event from triggering click
    if (isDragging || isSortableDragging) return;
    
    // Open task detail modal - will be handled by parent
    const event = new CustomEvent('openTaskDetail', { detail: { taskId: task.id } });
    window.dispatchEvent(event);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-white rounded-card p-4 border-0 shadow-soft hover:shadow-soft-lg transition cursor-pointer ${
        isDragging ? 'rotate-3 opacity-90' : ''
      }`}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        {task.status === 'BLOCKED' && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-medium text-text-primary mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Labels/Tags */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 2).map((label, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-text-secondary rounded text-xs">
              +{task.labels.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`text-xs mb-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-text-muted'}`}>
          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Assignee */}
        <div className="flex items-center">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-text-primary font-medium">
                  {getInitials(task.assignee.firstName, task.assignee.lastName)}
                </span>
              </div>
              <span className="text-xs text-text-secondary">
                {task.assignee.firstName}
              </span>
            </div>
          ) : (
            <span className="text-xs text-text-muted">Unassigned</span>
          )}
        </div>

        {/* Meta Icons */}
        <div className="flex items-center gap-3 text-text-muted">
          {task._count?.attachments && task._count.attachments > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3 h-3" />
              <span>{task._count.attachments}</span>
            </div>
          )}
          {task._count?.comments && task._count.comments > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageCircle className="w-3 h-3" />
              <span>{task._count.comments}</span>
            </div>
          )}
          {task._count?.subTasks && task._count.subTasks > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <CheckSquare className="w-3 h-3" />
              <span>{task._count.subTasks}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

