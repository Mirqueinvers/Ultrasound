interface AuthAPI {
  register: (data: { username: string; password: string; name: string }) => Promise<{
    success: boolean;
    message: string;
    userId?: number;
  }>;
  login: (data: { username: string; password: string }) => Promise<{
    success: boolean;
    message: string;
    user?: {
      id: number;
      username: string;
      name: string;
    };
  }>;
  getUser: (userId: number) => Promise<{
    id: number;
    username: string;
    name: string;
  } | null>;
}

interface WindowAPI {
  focus: () => void;
}

interface Window {
  authAPI: AuthAPI;
  windowAPI: WindowAPI;
}
