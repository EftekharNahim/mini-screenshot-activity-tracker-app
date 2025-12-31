// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

// Plan types
export interface Plan {
  id: number;
  name: string;
  pricePerEmployee: number;
  createdAt?: string;
  updatedAt?: string;
}

// Company types
export interface Company {
  id: number;
  owner_name: string;
  owner_email: string;
  company_name: string;
  plan_id: number | null;
  plan_name?: string;
  price_per_employee?: number;
}

export interface CompanySignupData {
  owner_name: string;
  owner_email: string;
  company_name: string;
  password: string;
  plan_id: number;
}

export interface CompanyLoginData {
  email: string;
  password: string;
}

// Employee types
export interface Employee {
  id: number;
  name: string;
  email: string;
  company_id: number;
  is_active: boolean;
  created_at: string;
  company_name?: string;
}

export interface EmployeeCreateData {
  name: string;
  email: string;
  password: string;
}

export interface EmployeeLoginData {
  email: string;
  password: string;
}

// Screenshot types
export interface Screenshot {
  id: number;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  minute: number;
}

export interface ScreenshotInterval {
  interval: number;
  start_minute: number;
  end_minute: number;
  screenshots: Screenshot[];
}

export interface ScreenshotHourGroup {
  hour: number;
  intervals_5min: ScreenshotInterval[];
  intervals_10min: ScreenshotInterval[];
}

export interface DashboardData {
  employee_id: number;
  date: string;
  total_screenshots: number;
  grouped_by_hour: ScreenshotHourGroup[];
}

export interface ScreenshotSummary {
  screenshot_date: string;
  screenshot_count: number;
  active_hours: number;
}

// Auth types
export type UserType = 'admin' | 'employee';

export interface AuthContextType {
  user: Company | Employee | null;
  userType: UserType | null;
  login: (token: string, type: UserType, userData: Company | Employee) => void;
  logout: () => void;
  loading: boolean;
}