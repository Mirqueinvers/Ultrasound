import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { LoginFormData } from '@/types/auth';
import { serverConfigService } from '@services';
import './Auth.css';

interface LoginProps {
  onLogin: (data: LoginFormData) => Promise<void>;
  onSwitchToRegister: () => void;
  onServerSetup?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister, onServerSetup }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Предзаполняем логин последнего вошедшего пользователя (этап 2.5).
  useEffect(() => {
    if (!serverConfigService.isAvailable()) return;
    serverConfigService
      .getConfig()
      .then((config) => {
        if (typeof config.lastLoginUsername === "string" && config.lastLoginUsername) {
          setFormData((prev) => ({ ...prev, username: config.lastLoginUsername as string }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите логин"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Нет аккаунта?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Зарегистрироваться
            </button>
          </p>
          {onServerSetup && (
            <p style={{ marginTop: 8 }}>
              <button
                type="button"
                className="link-button"
                onClick={onServerSetup}
              >
                Изменить адрес сервера
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;