// ==========================================
// Smart Campus - Core Type Definitions
// ==========================================

export type UserRole = 'student' | 'staff' | 'admin';

export type IssueStatus = 'reported' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'duplicate' | 'reopened';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueCategory =
  | 'plumbing'
  | 'electrical'
  | 'it_av'
  | 'cleanliness'
  | 'security'
  | 'transport'
  | 'furniture'
  | 'civil'
  | 'housekeeping'
  | 'other';

export type StaffStatus = 'available' | 'busy' | 'inactive';

// ==========================================
// User Types
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed in production
  collegeId: string;
  role: UserRole;
  departmentId?: string;
  avatar?: string;
  phone?: string;
  status?: StaffStatus;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  role: UserRole;
  departmentId?: string;
  avatar?: string;
  phone?: string;
  status?: StaffStatus;
  classSection?: string;
  rollNumber?: string;
  staffId?: string;
}

// ==========================================
// Department Types
// ==========================================

export interface Department {
  id: string;
  name: string;
  description: string;
  headId?: string;
  createdAt: string;
}

// ==========================================
// Issue Types
// ==========================================

export interface Issue {
  id: string;
  ticketNumber: string;
  studentId: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location: string;
  building: string;
  floor?: string;
  room: string;
  departmentId: string;
  assignedStaffId?: string;
  imageUrl?: string;
  status: IssueStatus;
  aiClassification?: AIClassification;
  resolutionNote?: string;
  safetyConcern?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssueHistory {
  id: string;
  issueId: string;
  status: IssueStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface CreateIssueData {
  description: string;
  location: string;
  building: string;
  floor?: string;
  room: string;
  category?: IssueCategory;
  imageUrl?: string;
}

// ==========================================
// AI Classification Types
// ==========================================

export interface AIClassification {
  category: IssueCategory;
  categoryLabel: string;
  priority: IssuePriority;
  department: string;
  departmentId: string;
  summary: string;
  safetyConcern: boolean;
  confidence: number;
}

export interface AIAnalysisRequest {
  description: string;
  imageUrl?: string;
  location?: string;
}

// ==========================================
// Notification Types
// ==========================================

export interface Notification {
  id: string;
  userId: string;
  issueId?: string;
  ticketNumber?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// Analytics Types
// ==========================================

export interface DashboardMetrics {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  completedIssues: number;
  criticalIssues: number;
  avgResolutionTime: string;
  resolvedToday: number;
  reportedToday: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  label: string;
}

export interface DepartmentWorkload {
  department: string;
  open: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
  label: string;
}

export interface IssueTrend {
  date: string;
  reported: number;
  resolved: number;
}

export interface RecurringIssue {
  location: string;
  building: string;
  room: string;
  category: IssueCategory;
  categoryLabel: string;
  count: number;
  period: string;
  departmentId: string;
  departmentName: string;
  lastReported: string;
  issueIds: string[];
}

// ==========================================
// Filter / Search Types
// ==========================================

export interface IssueFilters {
  status?: IssueStatus | 'all';
  priority?: IssuePriority | 'all';
  category?: IssueCategory | 'all';
  department?: string | 'all';
  search?: string;
  dateRange?: 'today' | '7days' | '30days' | 'all';
}

// ==========================================
// Form Types
// ==========================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ==========================================
// UI State Types
// ==========================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface AnalyticsTimeRange {
  label: string;
  value: 'today' | '7days' | '30days' | 'all';
}
