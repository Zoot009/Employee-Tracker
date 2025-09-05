import axios, { AxiosResponse } from 'axios';
import { 
  Employee, 
  CreateEmployeeRequest,
  Tag,
  CreateTagRequest,
  Assignment,
  CreateAssignmentRequest,
  Log,
  SubmitLogRequest,
  Warning,
  CreateWarningRequest,
  Break,
  BreakRequest,
  Issue,
  CreateIssueRequest,
  UpdateIssueRequest,
  ApiResponse,
  DashboardStats,
  EmployeeFilter,
  DateFilter
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Log more detailed error information
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
    });
    return Promise.reject(error);
  }
);

// Employee API
export const employeeApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Employee[]>>> =>
    api.get('/employees'),
    
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Employee>>> =>
    api.get(`/employees/${id}`),
    
  create: (data: CreateEmployeeRequest): Promise<AxiosResponse<ApiResponse<Employee>>> =>
    api.post('/employees', data),
    
  update: (id: number, data: Partial<CreateEmployeeRequest>): Promise<AxiosResponse<ApiResponse<Employee>>> =>
    api.put(`/employees/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/employees/${id}`),
    
  login: (employeeCode: string): Promise<AxiosResponse<ApiResponse<Employee>>> =>
    api.post('/employees/login', { employeeCode }),
};

// Tag API
export const tagApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Tag[]>>> =>
    api.get('/tags'),
    
  create: (data: CreateTagRequest): Promise<AxiosResponse<ApiResponse<Tag>>> =>
    api.post('/tags', data),
    
  update: (id: number, data: Partial<CreateTagRequest>): Promise<AxiosResponse<ApiResponse<Tag>>> =>
    api.put(`/tags/${id}`, data),
    
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/tags/${id}`),
};

// Assignment API
export const assignmentApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Assignment[]>>> =>
    api.get('/assignments'),
    
  getByEmployee: (employeeId: number): Promise<AxiosResponse<ApiResponse<Assignment[]>>> =>
    api.get(`/assignments?employeeId=${employeeId}`),
    
  create: (data: CreateAssignmentRequest): Promise<AxiosResponse<ApiResponse<Assignment>>> =>
    api.post('/assignments', data),
    
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/assignments/${id}`),
};

// Log API
export const logApi = {
  getByDate: (employeeId: number, logDate: string): Promise<AxiosResponse<ApiResponse<Log[]>>> =>
    api.get(`/logs/by-date?employeeId=${employeeId}&logDate=${logDate}`),
    
  getByDateRange: (filter: EmployeeFilter): Promise<AxiosResponse<ApiResponse<Log[]>>> =>
    api.get('/logs', { params: filter }),
    
  submit: (data: SubmitLogRequest): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/logs', data),
    
  update: (id: number, count: number): Promise<AxiosResponse<ApiResponse<Log>>> =>
    api.put(`/logs/${id}`, { count }),
    
  getDailyChart: (logDate: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/logs/daily-chart?logDate=${logDate}`),
};

// Warning API
export const warningApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Warning[]>>> =>
    api.get('/warnings'),
    
  getByEmployee: (employeeId: number): Promise<AxiosResponse<ApiResponse<Warning[]>>> =>
    api.get(`/warnings?employeeId=${employeeId}`),
    
  getActive: (): Promise<AxiosResponse<ApiResponse<Warning[]>>> =>
    api.get('/warnings?active=true'),
    
  create: (data: CreateWarningRequest): Promise<AxiosResponse<ApiResponse<Warning>>> =>
    api.post('/warnings', data),
    
  dismiss: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.put(`/warnings/${id}`, { isActive: false }),
};

// Break API
export const breakApi = {
  getByDate: (employeeId: number, breakDate: string): Promise<AxiosResponse<ApiResponse<Break[]>>> =>
    api.get(`/breaks?employeeId=${employeeId}&breakDate=${breakDate}`),
    
  getByDateRange: (filter: EmployeeFilter): Promise<AxiosResponse<ApiResponse<Break[]>>> =>
    api.get('/breaks', { params: filter }),
    
  getActive: (): Promise<AxiosResponse<ApiResponse<Break[]>>> =>
    api.get('/breaks?active=true'),
    
  breakIn: (data: BreakRequest): Promise<AxiosResponse<ApiResponse<Break>>> =>
    api.post('/breaks/in', data),
    
  breakOut: (data: BreakRequest): Promise<AxiosResponse<ApiResponse<Break>>> =>
    api.post('/breaks/out', data),
    
  getStatus: (employeeId: number): Promise<AxiosResponse<ApiResponse<Break | null>>> =>
    api.get(`/breaks/status?employeeId=${employeeId}`),
    
  sendWarning: (employeeId: number, breakId: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/breaks/warning', { employeeId, breakId }),
};

// Issue API
export const issueApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Issue[]>>> =>
    api.get('/issues'),
    
  getByEmployee: (employeeId: number): Promise<AxiosResponse<ApiResponse<Issue[]>>> =>
    api.get(`/issues?employeeId=${employeeId}`),
    
  getByStatus: (status: string): Promise<AxiosResponse<ApiResponse<Issue[]>>> =>
    api.get(`/issues?status=${status}`),
    
  create: (data: CreateIssueRequest): Promise<AxiosResponse<ApiResponse<Issue>>> =>
    api.post('/issues', data),
    
  update: (id: number, data: UpdateIssueRequest): Promise<AxiosResponse<ApiResponse<Issue>>> =>
    api.put(`/issues/${id}`, data),
};

// Dashboard API
export const dashboardApi = {
  getStats: (): Promise<AxiosResponse<ApiResponse<DashboardStats>>> =>
    api.get('/dashboard/stats'),
    
  getMissingData: (filter: DateFilter): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/dashboard/missing-data', { params: filter }),
};

export default api;