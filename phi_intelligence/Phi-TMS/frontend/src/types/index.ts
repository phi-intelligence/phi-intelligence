export type Role = 'ADMIN' | 'PROJECT_LEAD' | 'EMPLOYEE';
export type Region = 'UK' | 'INDIA' | 'BOTH';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE' | 'HALF_DAY';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: EmployeeProfile;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  designation: string;
  department: string;
  location: Region;
  joinDate: string;
  emergencyContact?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface LeaveType {
  id: string;
  name: string;
  region: Region;
  daysAllowed: number;
  accrualRate?: number;
  carryForward: boolean;
  isEncashable: boolean;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
  leaveType: LeaveType;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveRequestStatus;
  approverId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  leaveType: LeaveType;
  user?: User;
  approver?: User;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  region: Region;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  monthlyAttendance: {
    totalRecords: number;
    totalHours: number;
    overtimeHours: number;
  };
  recentActivity: any[];
}






