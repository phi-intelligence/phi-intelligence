import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../services/projectApi';
import type { Task } from '../../types/task';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, TaskStatus } from '../../types/task';
import LoadingSpinner from '../LoadingSpinner';
import { ExternalLink } from 'lucide-react';

interface ProjectTasksProps {
  projectId: string;
}

const ProjectTasks = ({ projectId }: ProjectTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjectTasks(projectId);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupTasksByStatus = () => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.BLOCKED]: [],
      [TaskStatus.DONE]: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  };

  const getStatusCount = (status: TaskStatus): number => {
    return tasks.filter((t) => t.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const groupedTasks = groupTasksByStatus();
  const miniStatuses: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white rounded-card shadow-soft border-0 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Task Overview</h3>
          <button
            onClick={() => navigate(`/projects/${projectId}/tasks`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Board
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.values(TaskStatus).map((status) => (
            <div key={status} className="text-center">
              <div className={`px-3 py-2 rounded-card ${TASK_STATUS_COLORS[status]} border`}>
                <div className="text-2xl font-bold">{getStatusCount(status)}</div>
                <div className="text-xs mt-1">{TASK_STATUS_LABELS[status]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Task Board */}
      <div className="bg-white rounded-card shadow-soft border-0 p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Task Preview</h3>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No tasks yet</h3>
            <p className="text-text-secondary mb-4">Create tasks to start tracking work on this project</p>
            <button
              onClick={() => navigate(`/projects/${projectId}/tasks`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition"
            >
              Create First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {miniStatuses.map((status) => (
              <div key={status} className="bg-gray-50 rounded-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-text-primary text-sm">
                    {TASK_STATUS_LABELS[status]}
                  </h4>
                  <span className="text-xs text-text-muted">
                    {groupedTasks[status].length}
                  </span>
                </div>

                <div className="space-y-2">
                  {groupedTasks[status].slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3 rounded border-0 hover:shadow-soft transition cursor-pointer"
                      onClick={() => {
                        // Will open task detail modal in future
                        console.log('Open task:', task.id);
                      }}
                    >
                      <div className="text-sm font-medium text-text-primary line-clamp-2 mb-2">
                        {task.title}
                      </div>
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-text-primary font-medium">
                              {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                            </span>
                          </div>
                          <span className="text-xs text-text-secondary">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {groupedTasks[status].length > 3 && (
                    <button
                      onClick={() => navigate(`/projects/${projectId}/tasks`)}
                      className="w-full text-center text-xs text-text-primary hover:text-blue-700 py-2"
                    >
                      +{groupedTasks[status].length - 3} more
                    </button>
                  )}

                  {groupedTasks[status].length === 0 && (
                    <div className="text-center text-xs text-text-muted py-4">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTasks;






