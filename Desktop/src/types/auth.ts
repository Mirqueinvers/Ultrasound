export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'doctor' | 'user';
  createdAt?: string;
  organization?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  organization?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  organization?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthError {
  message: string;
  field?: string;
}
