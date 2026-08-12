import { useState, useEffect } from 'react';
import type { User, LoginFormData, RegisterFormData } from '@/types/auth';
import { AuthContext, type AuthContextType } from './AuthContext';
import { authService, mobileHostService, windowService } from '@services';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Проверка сохраненной сессии при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');

        if (storedUserId && authService.isAvailable()) {
          // Загружаем данные пользователя из БД
          const userData = await authService.getUser(parseInt(storedUserId));

          if (userData) {
            const user: User = {
              id: userData.id.toString(),
              email: userData.username, // username используется как email
              name: userData.name,
              organization: userData.organization || undefined,
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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!mobileHostService.isAvailable()) {
      return;
    }

    void mobileHostService.setProfile({
      organization: user?.organization || null,
    });
  }, [isLoading, user?.organization]);

  const login = async (data: LoginFormData): Promise<void> => {
    try {
      if (!authService.isAvailable()) {
        throw new Error('Auth API недоступен');
      }

      const response = await authService.login({
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
        organization: response.user.organization || undefined,
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
      if (!authService.isAvailable()) {
        throw new Error('Auth API недоступен');
      }

      const response = await authService.register({
        username: data.email, // используем email как username
        password: data.password,
        name: data.name,
        organization: data.organization,
      });

      if (!response.success) {
        throw new Error(response.message || 'Ошибка регистрации');
      }

      if (!response.userId) {
        throw new Error('Не удалось создать пользователя');
      }

      // После регистрации загружаем данные пользователя
      const userData = await authService.getUser(response.userId);

      if (!userData) {
        throw new Error('Не удалось загрузить данные пользователя');
      }

      const user: User = {
        id: userData.id.toString(),
        email: userData.username,
        name: userData.name,
        organization: userData.organization || undefined,
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
      windowService.focus();
    }, 100);
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    // Обновляем состояние
    setUser(updatedUser);

    // Перезагружаем данные из БД для синхронизации
    if (authService.isAvailable() && updatedUser.id) {
      try {
        const userData = await authService.getUser(parseInt(updatedUser.id));
        if (userData) {
          const freshUser: User = {
            id: userData.id.toString(),
            email: userData.username,
            name: userData.name,
            organization: userData.organization || undefined,
            role: 'user',
          };
          setUser(freshUser);
        }
      } catch (error) {
        console.error('Ошибка обновления данных пользователя:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};