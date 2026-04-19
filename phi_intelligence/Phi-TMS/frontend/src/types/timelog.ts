import type { User } from './project';

export interface TimeLog {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
  isBillable: boolean;
  isApproved: boolean;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: User;
  project?: {
    id: string;
    name: string;
    projectCode: string;
  };
  task?: {
    id: string;
    title: string;
  };
  approvedBy?: User;
}

export interface TimeLogFormData {
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
  isBillable?: boolean;
}

export interface TimeLogFilters {
  userId?: string;
  projectId?: string;
  taskId?: string;
  startDate?: Date;
  endDate?: Date;
  isApproved?: boolean;
}

export interface TimesheetEntry {
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  timeLogs: {
    [date: string]: TimeLog | null;
  };
  totalHours: number;
  isApproved: boolean;
}

export interface TimeReport {
  projectId: string;
  projectName: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  approvedHours: number;
  pendingHours: number;
  byUser: {
    userId: string;
    userName: string;
    hours: number;
  }[];
  byTask?: {
    taskId: string;
    taskTitle: string;
    hours: number;
  }[];
}

export interface WeekDates {
  start: Date;
  end: Date;
  days: Date[];
}






