// src/lib/api-client.ts
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
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

// Create axios instance with optimizations
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // Increased timeout for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cache for GET requests (5 minutes)
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request deduplication for concurrent requests
const pendingRequests = new Map<string, Promise<any>>();

// Cache management
function getCacheKey(url: string, params?: any): string {
  return `${url}${params ? JSON.stringify(params) : ''}`;
}

function getCachedData(key: string): any | null {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  requestCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  requestCache.set(key, { data, timestamp: Date.now() });
}

// Enhanced request interceptor with caching and deduplication
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Only cache GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config.url!, config.params);
      
      // Return cached data if available
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return Promise.resolve({ ...config, __cached: true, __cachedData: cachedData });
      }
      
      // Handle concurrent requests
      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey)!.then(() => config);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle cached responses
    if (response.config.__cached && response.config.__cachedData) {
      return { ...response, data: response.config.__cachedData };
    }
    
    // Cache GET responses
    if (response.config.method === 'get' && response.data?.success) {
      const cacheKey = getCacheKey(response.config.url!, response.config.params);
      setCachedData(cacheKey, response.data);
      pendingRequests.delete(cacheKey);
    }
    
    return response;
  },
  (error) => {
    // Clean up pending requests on error
    if (error.config?.method === 'get') {
      const cacheKey = getCacheKey(error.config.url, error.config.params);
      pendingRequests.delete(cacheKey);
    }
    
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Helper function for cached GET requests
async function cachedGet<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
  const cacheKey = getCacheKey(url, params);
  
  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }
  
  // Make the request and store promise
  const requestPromise = api.get(url, { params });
  pendingRequests.set(cacheKey, requestPromise);
  
  try {
    const response = await requestPromise;
    return response;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

// Employee API with optimizations
export const employeeApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Employee[]>>> =>
    cachedGet('/employees'),
    
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Employee>>> =>
    cachedGet(`/employees/${id}`),
    
  create: (data: CreateEmployeeRequest): Promise<AxiosResponse<ApiResponse<Employee>>> => {
    // Clear employees cache after create
    requestCache.delete('/employees');
    return api.post('/employees', data);
  },
    
  update: (id: number, data: Partial<CreateEmployeeRequest>): Promise<AxiosResponse<ApiResponse<Employee>>> => {
    // Clear relevant caches
    requestCache.delete('/employees');
    requestCache.delete(`/employees/${id}`);
    return api.put(`/employees/${id}`, data);
  },
    
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> => {
    // Clear relevant caches
    requestCache.delete('/employees');
    requestCache.delete(`/employees/${id}`);
    return api.delete(`/employees/${id}`);
  },
    
  login: (employeeCode: string): Promise<AxiosResponse<ApiResponse<Employee>>> =>
    api.post('/employees/login', { employeeCode }),
};

// Tag API with optimizations
export const tagApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Tag[]>>> =>
    cachedGet('/tags'),
    
  create: (data: CreateTagRequest): Promise<AxiosResponse<ApiResponse<Tag>>> => {
    requestCache.delete('/tags');
    return api.post('/tags', data);
  },
    
  update: (id: number, data: Partial<CreateTagRequest>): Promise<AxiosResponse<ApiResponse<Tag>>> => {
    requestCache.delete('/tags');
    return api.put(`/tags/${id}`, data);
  },
    
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> => {
    requestCache.delete('/tags');
    return api.delete(`/tags/${id}`);
  },
};

// Assignment API with optimizations
export const assignmentApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Assignment[]>>> =>
    cachedGet('/assignments'),
    
  getByEmployee: (employeeId: number): Promise<AxiosResponse<ApiResponse<Assignment[]>>> =>
    cachedGet(`/assignments`, { employeeId }),
    
  create: (data: CreateAssignmentRequest): Promise<AxiosResponse<ApiResponse<Assignment>>> => {
    // Clear assignment caches
    requestCache.delete('/assignments');
    Array.from(requestCache.keys())
      .filter(key => key.startsWith('/assignments'))
      .forEach(key => requestCache.delete(key));
    return api.post('/assignments', data);
  },
    
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> => {
    // Clear assignment caches
    requestCache.delete('/assignments');
    Array.from(requestCache.keys())
      .filter(key => key.startsWith('/assignments'))
      .forEach(key => requestCache.delete(key));
    return api.delete(`/assignments/${id}`);
  },
};

// Log API with optimizations
export const logApi = {
  getByDate: (employeeId: number, logDate: string): Promise<AxiosResponse<ApiResponse<Log[]>>> =>
    cachedGet(`/logs/by-date`, { employeeId, logDate }),
    
  getByDateRange: (filter: EmployeeFilter): Promise<AxiosResponse<ApiResponse<Log[]>>> =>
    cachedGet('/logs', filter),
    
  submit: (data: SubmitLogRequest): Promise<AxiosResponse<ApiResponse<null>>> => {
    // Clear log caches for this employee and date
    Array.from(requestCache.keys())
      .filter(key => key.includes('/logs') && (
        key.includes(`employeeId\":${data.employeeId}`) ||
        key.includes(`logDate\":\"${data.logDate}\"`)
      ))
      .forEach(key => requestCache.delete(key));
    return api.post('/logs', data);
  },
    
  update: (id: number, count: number): Promise<AxiosResponse<ApiResponse<Log>>> => {
    // Clear log caches
    Array.from(requestCache.keys())
      .filter(key => key.includes('/logs'))
      .forEach(key => requestCache.delete(key));
    return api.put(`/logs/${id}`, { count });
  },
};

// Warning API
export const warningApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Warning[]>>> =>
    cachedGet('/warnings'),
    
  getByEmployee: (employeeId: number): Promise<AxiosResponse<ApiResponse<Warning[]>>> =>
    cachedGet('/warnings', { employeeId }),
    
  getActive: (): Promise<AxiosResponse<ApiResponse<Warning[]>>> =>
    cachedGet('/warnings', { active: true }),
    
  create: (data: CreateWarningRequest): Promise<AxiosResponse<ApiResponse<Warning>>> => {
    Array.from(requestCache.keys())
      .filter(key => key.includes('/warnings'))
      .forEach(key => requestCache.delete(key));
    return api.post('/warnings', data);
  },
    
  dismiss: (id: number): Promise<AxiosResponse<ApiResponse<null>>> => {
    Array.from(requestCache.keys())
      .filter(key => key.includes('/warnings'))
      .forEach(key => requestCache.delete(key));
    return api.put(`/warnings/${id}`, { isActive: false });
  },
};

// Break API with optimizations
export const breakApi = {
  getByDateRange: (filter: EmployeeFilter): Promise<AxiosResponse<ApiResponse<Break[]>>> =>
    cachedGet('/breaks', filter),
    
  breakIn: (data: BreakRequest): Promise<AxiosResponse<ApiResponse<Break>>> => {
    Array.from(requestCache.keys())
      .filter(key => key.includes('/breaks'))
      .forEach(key => requestCache.delete(key));
    return api.post('/breaks/in', data);
  },
    
  breakOut: (data: BreakRequest): Promise<AxiosResponse<ApiResponse<Break>>> => {
    Array.from(requestCache.keys())
      .filter(key => key.includes('/breaks'))
      .forEach(key => requestCache.delete(key));
    return api.post('/breaks/out', data);
  },
    
  getStatus: (employeeId: number): Promise<AxiosResponse<ApiResponse<Break | null>>> =>
    api.get(`/breaks/status`, { params: { employeeId } }), // Don't cache active status
    
  sendWarning: (employeeId: number, breakId: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/breaks/warning', { employeeId, breakId }),
};

// Issue API
export const issueApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Issue[]>>> =>
    cachedGet('/issues'),
    
  getByEmployee: (employeeId: number): Promise<AxiosResponse<ApiResponse<Issue[]>>> =>
    cachedGet('/issues', { employeeId }),
    
  create: (data: CreateIssueRequest): Promise<AxiosResponse<ApiResponse<Issue>>> => {
    Array.from(requestCache.keys())
      .filter(key => key.includes('/issues'))
      .forEach(key => requestCache.delete(key));
    return api.post('/issues', data);
  },
    
  update: (id: number, data: UpdateIssueRequest): Promise<AxiosResponse<ApiResponse<Issue>>> => {
    Array.from(requestCache.keys())
      .filter(key => key.includes('/issues'))
      .forEach(key => requestCache.delete(key));
    return api.put(`/issues/${id}`, data);
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: (): Promise<AxiosResponse<ApiResponse<DashboardStats>>> =>
    api.get('/dashboard/stats'), // Don't cache dashboard stats
};

// Cache management utilities
export const cacheUtils = {
  clear: () => {
    requestCache.clear();
    pendingRequests.clear();
  },
  
  clearByPattern: (pattern: string) => {
    Array.from(requestCache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => requestCache.delete(key));
  },
  
  getSize: () => requestCache.size,
};

export default api;