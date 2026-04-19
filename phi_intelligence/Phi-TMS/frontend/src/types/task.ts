import { Priority, User } from './project';

// Task Status Enum
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

// Task interface
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  reporterId: string;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  parentTaskId?: string;
  tags: string[];
  labels: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  assignee?: User;
  reporter?: User;
  parentTask?: Task;
  subTasks?: Task[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  checklists?: TaskChecklist[];
  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
  _count?: {
    comments?: number;
    attachments?: number;
    subTasks?: number;
  };
}

// Task Comment interface
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: User;
}

// Task Attachment interface
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  uploadedAt: string;
  
  // Relations
  uploadedBy?: User;
}

// Task Checklist interface
export interface TaskChecklist {
  id: string;
  taskId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  orderIndex: number;
}

// Task Dependency interface
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: DependencyType;
  createdAt: string;
  
  // Relations
  task?: Task;
  dependsOnTask?: Task;
}

export enum DependencyType {
  BLOCKS = 'BLOCKS',
  BLOCKED_BY = 'BLOCKED_BY',
  RELATES_TO = 'RELATES_TO',
}

// Form Data interfaces
export interface TaskFormData {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
  parentTaskId?: string;
  tags?: string[];
  labels?: string[];
}

export interface TaskCommentFormData {
  content: string;
}

export interface TaskAssignmentData {
  assigneeId: string;
}

export interface TaskStatusUpdateData {
  status: TaskStatus;
}

export interface TaskDependencyFormData {
  dependsOnTaskId: string;
  dependencyType?: DependencyType;
}

export interface TaskReorderData {
  taskId: string;
  newStatus: TaskStatus;
  newOrderIndex: number;
}

// Filters
export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  dueDate?: string;
  labels?: string[];
  tags?: string[];
}

// Status badge colors
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800 border-gray-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-300',
  [TaskStatus.IN_REVIEW]: 'bg-purple-100 text-purple-800 border-purple-300',
  [TaskStatus.BLOCKED]: 'bg-red-100 text-red-800 border-red-300',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-300',
};

// Status display names
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.BLOCKED]: 'Blocked',
  [TaskStatus.DONE]: 'Done',
};

// Kanban columns
export const KANBAN_COLUMNS = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.BLOCKED,
  TaskStatus.DONE,
] as const;






