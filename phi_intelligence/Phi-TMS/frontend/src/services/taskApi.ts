import axios from 'axios';
import type {
  Task,
  TaskFormData,
  TaskFilters,
  TaskCommentFormData,
  TaskAssignmentData,
  TaskStatusUpdateData,
  TaskDependencyFormData,
  TaskReorderData,
} from '../types/task';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const taskApi = {
  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  /**
   * Get tasks for a project
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data.data;
  },

  /**
   * Get current user's tasks
   */
  async getMyTasks(): Promise<Task[]> {
    const response = await api.get('/tasks/my-tasks');
    return response.data.data;
  },

  /**
   * Create new task
   */
  async createTask(data: TaskFormData): Promise<Task> {
    const response = await api.post(`/projects/${data.projectId}/tasks`, data);
    return response.data.data;
  },

  /**
   * Update task
   */
  async updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: string): Promise<Task> {
    const response = await api.put(`/tasks/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Assign task to user
   */
  async assignTask(id: string, data: TaskAssignmentData): Promise<Task> {
    const response = await api.put(`/tasks/${id}/assign`, data);
    return response.data.data;
  },

  /**
   * Reorder tasks (for Kanban drag & drop)
   */
  async reorderTasks(tasks: TaskReorderData[]): Promise<void> {
    await api.put('/tasks/reorder', { tasks });
  },

  /**
   * Add dependency to task
   */
  async addDependency(id: string, data: TaskDependencyFormData): Promise<void> {
    await api.post(`/tasks/${id}/dependencies`, data);
  },

  /**
   * Remove dependency from task
   */
  async removeDependency(id: string, dependsOnTaskId: string): Promise<void> {
    await api.delete(`/tasks/${id}/dependencies/${dependsOnTaskId}`);
  },

  /**
   * Add comment to task
   */
  async addComment(id: string, data: TaskCommentFormData): Promise<void> {
    await api.post(`/tasks/${id}/comments`, data);
  },
};






