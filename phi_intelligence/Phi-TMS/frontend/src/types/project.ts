// Project Status Enum
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Priority Enum
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Region Enum
export enum Region {
  UK = 'UK',
  INDIA = 'INDIA',
  BOTH = 'BOTH',
}

// User (simplified from backend)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  profilePictureUrl?: string;
}

// Project interface
export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  projectCode: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  region: Region;
  priority: Priority;
  projectLeadId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  projectLead?: User;
  createdBy?: User;
  members?: ProjectMember[];
  _count?: {
    tasks?: number;
    members?: number;
    timeLogs?: number;
  };
}

// Project Member interface
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  allocationPercentage: number;
  joinedDate: string;
  leftDate?: string;
  hoursAllocated?: number;
  hoursLogged?: number;
  
  // Relations
  user?: User;
  project?: Project;
}

// Project Metrics
export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  totalHours: number;
  estimatedHours: number;
  completionPercentage: number;
  teamSize: number;
  budgetUsed?: number;
  budgetRemaining?: number;
}

// Project Timeline
export interface ProjectTimeline {
  projectId: string;
  startDate: string;
  endDate?: string;
  currentDate: string;
  progressPercentage: number;
  daysElapsed: number;
  daysRemaining?: number;
  isOverdue: boolean;
  milestones: Milestone[];
  recentActivity: Activity[];
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  orderIndex: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// Form Data interfaces
export interface ProjectFormData {
  name: string;
  description?: string;
  clientName?: string;
  projectCode: string;
  status?: ProjectStatus;
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  budget?: number;
  projectLeadId: string;
  region: Region;
  priority: Priority;
}

export interface ProjectMemberFormData {
  userId: string;
  role: string;
  allocationPercentage?: number;
  hoursAllocated?: number;
}

// Filters
export interface ProjectFilters {
  status?: ProjectStatus;
  projectLeadId?: string;
  region?: Region;
  priority?: Priority;
  search?: string;
}

// Status badge colors
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'bg-gray-100 text-gray-800',
  [ProjectStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

// Priority badge colors
export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-text-secondary',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-700',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700',
  [Priority.CRITICAL]: 'bg-red-100 text-red-700',
};






