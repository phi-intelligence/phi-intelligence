import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { taskApi } from '../../services/taskApi';
import type { Task, TaskStatus } from '../../types/task';
import { KANBAN_COLUMNS, TASK_STATUS_LABELS } from '../../types/task';
import LoadingSpinner from '../../components/LoadingSpinner';
import TaskColumn from '../../components/tasks/TaskColumn';
import TaskCard from '../../components/tasks/TaskCard';
import TaskTable from '../../components/tasks/TaskTable';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import TimeLogModal from '../../components/time/TimeLogModal';
import toast from 'react-hot-toast';

const TaskBoard = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [timeLogModalData, setTimeLogModalData] = useState<{ projectId?: string; taskId?: string } | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    const handleOpenTask = (event: any) => {
      setSelectedTaskId(event.detail.taskId);
    };

    const handleOpenTimeLog = (event: any) => {
      setTimeLogModalData(event.detail);
    };

    window.addEventListener('openTaskDetail', handleOpenTask);
    window.addEventListener('openTimeLogModal', handleOpenTimeLog);
    
    return () => {
      window.removeEventListener('openTaskDetail', handleOpenTask);
      window.removeEventListener('openTimeLogModal', handleOpenTimeLog);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = projectId
        ? await taskApi.getProjectTasks(projectId)
        : await taskApi.getMyTasks();
      setTasks(data);
      setFilteredTasks(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);

    try {
      // Get tasks in the new column
      const tasksInColumn = updatedTasks.filter((t) => t.status === newStatus);
      const newOrderIndex = tasksInColumn.length - 1;

      // Call API to reorder
      await taskApi.reorderTasks([
        {
          taskId,
          newStatus,
          newOrderIndex,
        },
      ]);
      
      toast.success('Task moved successfully');
    } catch (err: any) {
      // Revert on error
      setTasks(tasks);
      setFilteredTasks(tasks);
      toast.error(err.response?.data?.message || 'Failed to move task');
    }
  };

  const handleFilter = (filtered: Task[]) => {
    setFilteredTasks(filtered);
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return filteredTasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Task Board</h1>
          <p className="text-text-secondary mt-1">
            {projectId ? 'Project tasks' : 'All your tasks'} • {filteredTasks.length} task
            {filteredTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            type="button"
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'board' ? 'bg-white shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'table' ? 'bg-white shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters tasks={tasks} onFilter={handleFilter} />

      {/* Board or Table view */}
      {viewMode === 'table' ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <TaskTable
            tasks={filteredTasks}
            projectId={projectId}
            onOpenTask={setSelectedTaskId}
            onLogTime={(taskId) => setTimeLogModalData({ projectId: projectId || undefined, taskId })}
            onTaskCreated={fetchTasks}
          />
        </div>
      ) : (
      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {KANBAN_COLUMNS.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={getTasksByStatus(status)}
                projectId={projectId}
                onTaskCreated={fetchTasks}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <TaskCard task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={fetchTasks}
        />
      )}

      {/* Time Log Modal */}
      {timeLogModalData && (
        <TimeLogModal
          onClose={() => setTimeLogModalData(null)}
          onSuccess={fetchTasks}
          prefilledProjectId={timeLogModalData.projectId}
          prefilledTaskId={timeLogModalData.taskId}
        />
      )}
    </div>
  );
};

export default TaskBoard;

