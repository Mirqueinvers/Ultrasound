import { createContext, useState, useContext, useEffect } from 'react';
import type { User, LoginFormData, RegisterFormData } from '@/types/auth';

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
    const initAuth = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        
        if (storedUserId && window.authAPI) {
          // Загружаем данные пользователя из БД
          const userData = await window.authAPI.getUser(parseInt(storedUserId));
          
          if (userData) {
            const user: User = {
              id: userData.id.toString(),
              email: userData.username, // username используется как email
              name: userData.name,
              role: 'user',
            };
            setUser(user);
          } else {
            // Если пользователь не найден, очищаем localStorage
            localStorage.removeItem('userId');
          }
        }
      } catch (error) {
        console.error('Ошибка восстановления сессии:', error);
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginFormData): Promise<void> => {
    try {
      if (!window.authAPI) {
        throw new Error('Auth API недоступен');
      }

      const response = await window.authAPI.login({
        username: data.email, // используем email как username
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.message || 'Ошибка входа');
      }

      if (!response.user) {
        throw new Error('Пользователь не найден');
      }

      const user: User = {
        id: response.user.id.toString(),
        email: response.user.username,
        name: response.user.name,
        role: 'user',
      };

      // Сохраняем только userId
      localStorage.setItem('userId', response.user.id.toString());
      
      setUser(user);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      if (!window.authAPI) {
        throw new Error('Auth API недоступен');
      }

      const response = await window.authAPI.register({
        username: data.email, // используем email как username
        password: data.password,
        name: data.name,
      });

      if (!response.success) {
        throw new Error(response.message || 'Ошибка регистрации');
      }

      if (!response.userId) {
        throw new Error('Не удалось создать пользователя');
      }

      // После регистрации загружаем данные пользователя
      const userData = await window.authAPI.getUser(response.userId);

      if (!userData) {
        throw new Error('Не удалось загрузить данные пользователя');
      }

      const user: User = {
        id: userData.id.toString(),
        email: userData.username,
        name: userData.name,
        role: 'user',
      };

      // Сохраняем userId
      localStorage.setItem('userId', userData.id.toString());
      
      setUser(user);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('userId');
    setUser(null);
    
    // Принудительно фокусируем окно после выхода
    setTimeout(() => {
      if (window.windowAPI) {
        window.windowAPI.focus();
      }
    }, 100);
  };


  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    // userId не меняется, поэтому не обновляем localStorage
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
