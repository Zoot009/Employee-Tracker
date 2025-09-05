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
  warningDate: string;
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

export interface EmployeeFilter extends DateFilter {
  employeeId?: number;
}

// Session Types (for employee login)
export interface EmployeeSession {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
}