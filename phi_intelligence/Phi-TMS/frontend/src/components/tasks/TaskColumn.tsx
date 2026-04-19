import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types/task';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '../../types/task';
import TaskCard from './TaskCard';
import QuickAddTask from './QuickAddTask';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  projectId?: string;
  onTaskCreated: () => void;
}

const TaskColumn = ({ status, tasks, projectId, onTaskCreated }: TaskColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-card p-4 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${TASK_STATUS_COLORS[status]} border`}>
            {TASK_STATUS_LABELS[status]}
          </span>
          <span className="text-sm text-text-secondary">{tasks.length}</span>
        </div>
      </div>

      {/* Task List */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-text-muted">
              No tasks
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>

      {/* Quick Add Task */}
      {projectId && (
        <QuickAddTask
          projectId={projectId}
          defaultStatus={status}
          onTaskCreated={onTaskCreated}
        />
      )}
    </div>
  );
};

export default TaskColumn;






