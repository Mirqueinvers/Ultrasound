import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './UserMenu.css';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-menu__avatar">
          {getInitials(user.name)}
        </div>
        <span className="user-menu__name">{user.name}</span>
        <svg 
          className={`user-menu__icon ${isOpen ? 'user-menu__icon--open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          <div className="user-menu__header">
            <div className="user-menu__avatar user-menu__avatar--large">
              {getInitials(user.name)}
            </div>
            <div className="user-menu__info">
              <div className="user-menu__info-name">{user.name}</div>
              <div className="user-menu__info-email">{user.email}</div>
              {user.role && (
                <div className="user-menu__info-role">
                  {user.role === 'admin' && '👑 Администратор'}
                  {user.role === 'doctor' && '👨‍⚕️ Врач'}
                  {user.role === 'user' && '👤 Пользователь'}
                </div>
              )}
            </div>
          </div>

          <div className="user-menu__divider" />

          <button 
            className="user-menu__item"
            onClick={() => {
              setIsOpen(false);
              // TODO: navigate to profile
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" 
                fill="currentColor"
              />
            </svg>
            Профиль
          </button>

          <button 
            className="user-menu__item"
            onClick={() => {
              setIsOpen(false);
              // TODO: navigate to settings
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M13.5 8C13.5 8.17 13.49 8.34 13.47 8.51L15.11 9.77C15.25 9.89 15.29 10.09 15.21 10.26L13.65 13.24C13.57 13.41 13.38 13.48 13.2 13.42L11.27 12.64C10.89 12.93 10.48 13.17 10.02 13.37L9.75 15.42C9.72 15.61 9.56 15.75 9.37 15.75H6.25C6.06 15.75 5.9 15.61 5.87 15.42L5.6 13.37C5.14 13.17 4.73 12.93 4.35 12.64L2.42 13.42C2.24 13.48 2.05 13.41 1.97 13.24L0.41 10.26C0.33 10.09 0.37 9.89 0.51 9.77L2.15 8.51C2.13 8.34 2.12 8.17 2.12 8C2.12 7.83 2.13 7.66 2.15 7.49L0.51 6.23C0.37 6.11 0.33 5.91 0.41 5.74L1.97 2.76C2.05 2.59 2.24 2.52 2.42 2.58L4.35 3.36C4.73 3.07 5.14 2.83 5.6 2.63L5.87 0.58C5.9 0.39 6.06 0.25 6.25 0.25H9.37C9.56 0.25 9.72 0.39 9.75 0.58L10.02 2.63C10.48 2.83 10.89 3.07 11.27 3.36L13.2 2.58C13.38 2.52 13.57 2.59 13.65 2.76L15.21 5.74C15.29 5.91 15.25 6.11 15.11 6.23L13.47 7.49C13.49 7.66 13.5 7.83 13.5 8ZM7.81 5C6.35 5 5.16 6.19 5.16 7.65C5.16 9.11 6.35 10.3 7.81 10.3C9.27 10.3 10.46 9.11 10.46 7.65C10.46 6.19 9.27 5 7.81 5Z" 
                fill="currentColor"
              />
            </svg>
            Настройки
          </button>

          <div className="user-menu__divider" />

          <button 
            className="user-menu__item user-menu__item--logout"
            onClick={handleLogout}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6M11 11L14 8L11 5M14 8H6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
