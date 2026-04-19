import axios from 'axios';
import {
  type Project,
  type ProjectFormData,
  type ProjectMember,
  type ProjectMemberFormData,
  type ProjectMetrics,
  type ProjectTimeline,
  type ProjectFilters,
  Priority,
  Region,
} from '../types/project';

// Use same base as main api (with /api) so paths are relative: /projects not /api/projects
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

/** Backend project response (snake_case) */
interface BackendProject {
  id: string;
  name: string;
  description?: string | null;
  client_name?: string | null;
  project_code: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  budget?: number | null;
  region: string;
  priority: string;
  project_lead_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  project_lead?: {
    id: string;
    username: string;
    profile?: { first_name?: string | null; last_name?: string | null } | null;
  } | null;
  _count?: { tasks?: number; members?: number };
}

function mapProjectFromBackend(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description != null ? p.description : undefined,
    clientName: p.client_name ?? undefined,
    projectCode: p.project_code,
    status: p.status as Project['status'],
    startDate: p.start_date ?? new Date().toISOString(),
    endDate: p.end_date != null ? p.end_date : undefined,
    estimatedHours: p.estimated_hours ?? undefined,
    actualHours: p.actual_hours ?? undefined,
    budget: p.budget ?? undefined,
    region: p.region as Region,
    priority: p.priority as Priority,
    projectLeadId: p.project_lead_id,
    createdById: p.created_by_id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    projectLead: p.project_lead
      ? {
          id: p.project_lead.id,
          email: '',
          firstName: p.project_lead.profile?.first_name ?? '',
          lastName: p.project_lead.profile?.last_name ?? '',
          role: 'PROJECT_LEAD',
        }
      : undefined,
    createdBy: undefined,
    _count: p._count ? { tasks: p._count.tasks, members: p._count.members } : undefined,
  };
}

export const projectApi = {
  /**
   * Get all projects with optional filters (real API)
   */
  async getProjects(filters?: ProjectFilters, page = 1, limit = 50): Promise<Project[]> {
    const params: Record<string, string | number> = { page, limit };
    if (filters?.status) params.status = filters.status;
    if (filters?.projectLeadId) params.project_lead_id = filters.projectLeadId;
    if (filters?.region) params.region = filters.region;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;
    const response = await api.get<{ success: boolean; data: BackendProject[]; pagination?: unknown }>(
      '/projects/',
      { params }
    );
    const list = Array.isArray(response.data?.data) ? response.data.data : [];
    return list.map(mapProjectFromBackend);
  },

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  /**
   * Create new project
   */
  async createProject(data: ProjectFormData): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data.data;
  },

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  /**
   * Update project status
   */
  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const response = await api.put(`/projects/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Get project metrics
   */
  async getProjectMetrics(id: string): Promise<ProjectMetrics> {
    const response = await api.get(`/projects/${id}/metrics`);
    return response.data.data;
  },

  /**
   * Get project timeline
   */
  async getProjectTimeline(id: string): Promise<ProjectTimeline> {
    const response = await api.get(`/projects/${id}/timeline`);
    return response.data.data;
  },

  /**
   * Get project team members
   */
  async getProjectMembers(id: string): Promise<ProjectMember[]> {
    const response = await api.get(`/projects/${id}/members`);
    return response.data.data;
  },

  /**
   * Add team member to project
   */
  async addTeamMember(id: string, data: ProjectMemberFormData): Promise<ProjectMember> {
    const response = await api.post(`/projects/${id}/members`, data);
    return response.data.data;
  },

  /**
   * Update team member
   */
  async updateTeamMember(
    projectId: string,
    userId: string,
    data: Partial<ProjectMemberFormData>
  ): Promise<ProjectMember> {
    const response = await api.put(`/projects/${projectId}/members/${userId}`, data);
    return response.data.data;
  },

  /**
   * Remove team member from project
   */
  async removeTeamMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },

  /**
   * Get project tasks
   */
  async getProjectTasks(id: string) {
    const response = await api.get(`/projects/${id}/tasks`);
    return response.data.data;
  },

  /**
   * Create task in project
   */
  async createProjectTask(id: string, data: any) {
    const response = await api.post(`/projects/${id}/tasks`, data);
    return response.data.data;
  },
};






