import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import type { LoginFormData, RegisterFormData } from '@/types/auth';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  onLogin: (data: LoginFormData) => Promise<void>;
  onRegister: (data: RegisterFormData) => Promise<void>;
  onServerSetup?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, onServerSetup }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <>
      {mode === 'login' ? (
        <Login 
          key="login-form" // Добавили key
          onLogin={onLogin}
          onSwitchToRegister={() => setMode('register')}
          onServerSetup={onServerSetup}
        />
      ) : (
        <Register 
          key="register-form" // Добавили key
          onRegister={onRegister}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </>
  );
};

export default AuthForm;
