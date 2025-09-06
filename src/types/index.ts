// src/types/index.ts - Enhanced with additional utility types

// Employee Types
export interface Employee {
  id: number;
  name: string;
  email: string;
  employeeCode: string;
  createdAt: Date;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  employeeCode: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  employeeCode?: string;
}

// Tag Types
export interface Tag {
  id: number;
  tagName: string;
  timeMinutes: number;
  createdAt: Date;
}

export interface CreateTagRequest {
  tagName: string;
  timeMinutes: number;
}

export interface UpdateTagRequest {
  tagName?: string;
  timeMinutes?: number;
}

// Assignment Types
export interface Assignment {
  id: number;
  employeeId: number;
  tagId: number;
  isMandatory: boolean;
  createdAt: Date;
  employee?: Employee;
  tag?: Tag;
}

export interface CreateAssignmentRequest {
  employeeId: number;
  tagId: number;
  isMandatory: boolean;
}

// Log Types
export interface Log {
  id: number;
  employeeId: number;
  tagId: number;
  count: number;
  totalMinutes: number;
  logDate: Date;
  createdAt: Date;
  employee?: Employee;
  tag?: Tag;
}

export interface CreateLogRequest {
  employeeId: number;
  tagId: number;
  count: number;
  logDate: string;
}

export interface SubmitLogRequest {
  employeeId: number;
  logs: {
    tagId: number;
    count: number;
  }[];
  logDate: string;
}

export interface UpdateLogRequest {
  count: number;
}

// Warning Types
export interface Warning {
  id: number;
  employeeId: number;
  warningDate: Date;
  warningMessage: string;
  isActive: boolean;
  createdAt: Date;
  employee?: Employee;
}

export interface CreateWarningRequest {
  employeeId: number;
  warningMessage: string;
  warningDate?: string;
}

export interface UpdateWarningRequest {
  isActive?: boolean;
  warningMessage?: string;
}

// Submission Status Types
export interface SubmissionStatus {
  id: number;
  employeeId: number;
  submissionDate: Date;
  submissionTime: Date;
  isLocked: boolean;
  totalMinutes: number;
  statusMessage: string;
  employee?: Employee;
}

// Break Types
export interface Break {
  id: number;
  employeeId: number;
  breakDate: Date;
  breakInTime?: Date;
  breakOutTime?: Date;
  breakDuration: number;
  isActive: boolean;
  warningSent: boolean;
  createdAt: Date;
  employee?: Employee;
}

export interface BreakRequest {
  employeeId: number;
}

export interface BreakWarningRequest {
  employeeId: number;
  breakId: number;
}

// Issue Types
export interface Issue {
  id: number;
  employeeId: number;
  issueCategory: string;
  issueDescription: string;
  issueStatus: 'pending' | 'in_progress' | 'resolved';
  raisedDate: Date;
  resolvedDate?: Date;
  adminResponse?: string;
  daysElapsed: number;
  employee?: Employee;
}

export interface CreateIssueRequest {
  employeeId: number;
  issueCategory: string;
  issueDescription: string;
}

export interface UpdateIssueRequest {
  issueStatus?: 'pending' | 'in_progress' | 'resolved';
  adminResponse?: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

// Performance Data Types
export interface PerformanceMetrics {
  totalMinutes: number;
  totalDays: number;
  avgMinutesPerDay: number;
  tagPerformance: Record<string, {
    totalMinutes: number;
    totalCount: number;
    timePerUnit: number;
  }>;
  dailyPerformance: Record<string, number>;
}

export interface WeeklyStats {
  totalMinutes: number;
  daysWorked: number;
  avgPerDay: number;
}

// Dashboard Data Types
export interface DashboardData {
  todayLogs: Log[];
  currentBreak: Break | null;
  recentIssues: Issue[];
  activeWarnings: Warning[];
  weeklyStats: WeeklyStats;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// Dashboard Stats
export interface DashboardStats {
  totalEmployees: number;
  totalTags: number;
  todaysSubmissions: number;
  pendingIssues: number;
}

// Filter Types
export interface DateFilter {
  dateFrom: string;
  dateTo: string;
}

export interface EmployeeFilter extends Partial<DateFilter> {
  employeeId?: number;
  logDate?: string;
  breakDate?: string;
  active?: boolean;
  status?: 'pending' | 'in_progress' | 'resolved';
}

// Session Types (for employee login)
export interface EmployeeSession {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
}

// Login Response Types
export interface LoginResponse {
  employee: Employee;
  session: EmployeeSession;
}

// Summary Types
export interface LogsSummary {
  today: {
    logs: Log[];
    totalMinutes: number;
    totalEntries: number;
  };
  weekly: {
    logs: Log[];
    totalMinutes: number;
    daysWorked: number;
    averagePerDay: number;
  };
}

// Utility Types
export type IssueCategory = 'Equipment' | 'Cleanliness' | 'Documents' | 'Stationery' | 'IT Support' | 'Other';
export type IssueStatus = 'pending' | 'in_progress' | 'resolved';
export type DateRangePreset = 'week' | 'month' | 'quarter';

// Form State Types
export interface EmployeeFormData {
  name: string;
  email: string;
  employeeCode: string;
}

export interface TagFormData {
  tagName: string;
  timeMinutes: number;
}

export interface IssueFormData {
  issueCategory: string;
  issueDescription: string;
}

export interface WorkLogFormData {
  logs: Record<number, number>; // tagId -> count
}

// Component Props Types
export interface EmployeePanelProps {
  employee: Employee;
  onLogout: () => void;
}

export interface WorkLogFormProps {
  employeeId: number;
  selectedDate: string;
  assignments: Assignment[];
  onSubmitSuccess: () => void;
}

export interface BreakTrackerProps {
  employeeId: number;
  currentBreak: Break | null;
  onBreakIn: () => void;
  onBreakOut: () => void;
}

export interface IssueFormProps {
  employeeId: number;
  onSubmitSuccess: () => void;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: ValidationError[] | string;
}

// Loading State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}