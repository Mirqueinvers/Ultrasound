import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import type { LoginFormData, RegisterFormData } from '@/types/auth';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  onLogin: (data: LoginFormData) => Promise<void>;
  onRegister: (data: RegisterFormData) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <>
      {mode === 'login' ? (
        <Login 
          onLogin={onLogin}
          onSwitchToRegister={() => setMode('register')}
        />
      ) : (
        <Register 
          onRegister={onRegister}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </>
  );
};

export default AuthForm;
