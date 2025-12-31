import { createContext, useState, useContext, useEffect } from 'react';
import type { User, LoginFormData, RegisterFormData, AuthResponse } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Проверка сохраненной сессии при загрузке
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Ошибка восстановления сессии:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginFormData): Promise<void> => {
    try {
      // TODO: Заменить на реальный API запрос
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const result: AuthResponse = await response.json();

      // Временная заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: data.email,
          name: 'Тестовый Пользователь',
          role: 'doctor',
        },
        token: 'mock-jwt-token',
      };

      // Сохраняем в localStorage
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      localStorage.setItem('token', mockResponse.token);
      
      setUser(mockResponse.user);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw new Error('Не удалось войти в систему');
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      // TODO: Заменить на реальный API запрос
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const result: AuthResponse = await response.json();

      // Временная заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse: AuthResponse = {
        user: {
          id: '2',
          email: data.email,
          name: data.name,
          role: 'user',
        },
        token: 'mock-jwt-token-new',
      };

      // Сохраняем в localStorage
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      localStorage.setItem('token', mockResponse.token);
      
      setUser(mockResponse.user);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw new Error('Не удалось зарегистрироваться');
    }
  };

  const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
