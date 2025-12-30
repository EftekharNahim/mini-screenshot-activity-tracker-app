import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  Plan,
  Company,
  CompanySignupData,
  CompanyLoginData,
  Employee,
  EmployeeCreateData,
  EmployeeLoginData,
  DashboardData,
  ScreenshotSummary
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Company API
export const companyAPI = {
  getPlans: () => api.get<ApiResponse<Plan[]>>('/company/plans'),
  
  signup: (data: CompanySignupData) => 
    api.post<ApiResponse<{ company: Company; token: string }>>('/company/signup', data),
  
  login: (data: CompanyLoginData) => 
    api.post<ApiResponse<{ company: Company; token: string }>>('/company/login', data),
};

// Employee API
export const employeeAPI = {
  add: (data: EmployeeCreateData) => 
    api.post<ApiResponse<{ id: number; name: string; email: string; company_id: number; token: string }>>('/employee/add', data),
  
  list: () => 
    api.get<ApiResponse<Employee[]>>('/employee/list'),
  
  search: (query: string) => 
    api.get<ApiResponse<Employee[]>>('/employee/search', { params: { query } }),
  
  login: (data: EmployeeLoginData) => 
    api.post<ApiResponse<{ employee: Employee; token: string }>>('/employee/login', data),
  
  rotateToken: () => 
    api.post<ApiResponse<{ token: string }>>('/employee/rotate-token'),
  
  toggleStatus: (id: number) => 
    api.patch<ApiResponse<Employee>>(`/employee/${id}/toggle-status`),
};

// Screenshot API
export const screenshotAPI = {
  upload: (formData: FormData) => 
    api.post<ApiResponse<{ id: number; uploaded_at: string; file_size: number; file_path: string }>>('/screenshots/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getDashboard: (employeeId: number, date: string) =>
    api.get<ApiResponse<DashboardData>>('/screenshots/dashboard', { 
      params: { employee_id: employeeId, date } 
    }),
  
  getSummary: (employeeId: number, startDate?: string, endDate?: string) =>
    api.get<ApiResponse<ScreenshotSummary[]>>(`/screenshots/summary/${employeeId}`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  
  getFile: (id: number) => 
    api.get(`/screenshots/file/${id}`, { responseType: 'blob' }),
};

export default api;