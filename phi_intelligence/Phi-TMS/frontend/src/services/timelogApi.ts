import axios from 'axios';
import type { TimeLog, TimeLogFormData, TimeLogFilters, TimeReport } from '../types/timelog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Backend timesheet response shape */
interface TimesheetResponse {
  user_id: string;
  start_date: string;
  end_date: string;
  time_logs: Array<{
    id: string;
    user_id: string;
    project_id: string;
    task_id?: string;
    date: string;
    hours: number;
    description?: string;
    is_billable?: boolean;
    hourly_rate?: number;
    approved_by_id?: string | null;
    approved_at?: string | null;
    created_at: string;
    updated_at: string;
    project?: { id: string; name: string; project_code: string } | null;
    task?: { id: string; title: string } | null;
  }>;
  summary: {
    total_hours: number;
    approved_hours: number;
    pending_hours: number;
    total_entries: number;
  };
}

function mapTimeLogFromBackend(log: TimesheetResponse['time_logs'][0]): TimeLog {
  return {
    id: log.id,
    userId: log.user_id,
    projectId: log.project_id,
    taskId: log.task_id ?? undefined,
    date: log.date,
    hours: log.hours,
    description: log.description,
    isBillable: log.is_billable ?? false,
    isApproved: log.approved_by_id != null,
    approvedById: log.approved_by_id ?? undefined,
    approvedAt: log.approved_at ?? undefined,
    createdAt: log.created_at,
    updatedAt: log.updated_at,
    project: log.project ? { id: log.project.id, name: log.project.name, projectCode: log.project.project_code } : undefined,
    task: log.task ? { id: log.task.id, title: log.task.title } : undefined,
  };
}

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

export const timelogApi = {
  /**
   * Log time for a project/task
   */
  async logTime(data: TimeLogFormData): Promise<TimeLog> {
    const response = await api.post('/timelogs', data);
    return response.data.data;
  },

  /**
   * Get time logs with filters
   */
  async getTimeLogs(filters?: TimeLogFilters): Promise<TimeLog[]> {
    const params = new URLSearchParams();
    
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.taskId) params.append('taskId', filters.taskId);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters?.isApproved !== undefined) params.append('isApproved', String(filters.isApproved));

    const response = await api.get(`/timelogs?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get time log by ID
   */
  async getTimeLogById(id: string): Promise<TimeLog> {
    const response = await api.get(`/timelogs/${id}`);
    return response.data.data;
  },

  /**
   * Update time log
   */
  async updateTimeLog(id: string, data: Partial<TimeLogFormData>): Promise<TimeLog> {
    const response = await api.put(`/timelogs/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete time log
   */
  async deleteTimeLog(id: string): Promise<void> {
    await api.delete(`/timelogs/${id}`);
  },

  /**
   * Approve time log
   */
  async approveTimeLog(id: string): Promise<TimeLog> {
    const response = await api.put(`/timelogs/${id}/approve`);
    return response.data.data;
  },

  /**
   * Reject time log
   */
  async rejectTimeLog(id: string, reason: string): Promise<void> {
    await api.put(`/timelogs/${id}/reject`, { reason });
  },

  /**
   * Get user timesheet for date range. Returns time logs (camelCase) and optional summary.
   */
  async getUserTimesheet(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeLog[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    const response = await api.get(`/timelogs/timesheet/${userId}?${params.toString()}`);
    const data: TimesheetResponse = response.data.data;
    const logs = Array.isArray(data?.time_logs) ? data.time_logs : [];
    return logs.map(mapTimeLogFromBackend);
  },

  /**
   * Get user timesheet with summary for dashboard (e.g. total hours this week).
   */
  async getUserTimesheetWithSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ timeLogs: TimeLog[]; summary: { totalHours: number; approvedHours: number; pendingHours: number } }> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    const response = await api.get(`/timelogs/timesheet/${userId}?${params.toString()}`);
    const data: TimesheetResponse = response.data.data;
    const logs = Array.isArray(data?.time_logs) ? data.time_logs : [];
    return {
      timeLogs: logs.map(mapTimeLogFromBackend),
      summary: data?.summary
        ? {
            totalHours: data.summary.total_hours,
            approvedHours: data.summary.approved_hours,
            pendingHours: data.summary.pending_hours,
          }
        : { totalHours: 0, approvedHours: 0, pendingHours: 0 },
    };
  },

  /**
   * Get project time report
   */
  async getProjectTimeReport(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await api.get(
      `/timelogs/project/${projectId}/report?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get pending approvals for current user (if they're a project lead)
   */
  async getPendingApprovals(): Promise<TimeLog[]> {
    const response = await api.get('/timelogs/pending-approvals');
    return response.data.data;
  },
};






