export interface AuthAPI {
  register: (data: { 
    username: string; 
    password: string; 
    name: string; 
    organization?: string;
  }) => Promise<{
    success: boolean;
    message: string;
    userId?: number;
  }>;
  login: (data: { 
    username: string; 
    password: string;
  }) => Promise<{
    success: boolean;
    message: string;
    user?: any;
  }>;
  getUser: (userId: number) => Promise<any>;
  updateUser: (data: { 
    id: number; 
    name: string; 
    username: string; 
    organization?: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  changePassword: (data: { 
    userId: number; 
    currentPassword: string; 
    newPassword: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export interface WindowAPI {
  focus: () => void;
}

declare global {
  interface Window {
    authAPI: AuthAPI;
    windowAPI: WindowAPI;
  }
}

export {};
