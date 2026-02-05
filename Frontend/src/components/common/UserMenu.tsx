import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './UserMenu.css';

interface UserMenuProps {
  onNavigateToProfile: () => void;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-base font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mb-4 text-sm text-slate-700">{message}</p>

        <div className="mt-2 flex justify-end gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Отмена
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
};

const UserMenu: React.FC<UserMenuProps> = ({ onNavigateToProfile }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleCloseDialog = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onNavigateToProfile();
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
    <>
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
              onClick={handleProfileClick}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" 
                  fill="currentColor"
                />
              </svg>
              Профиль
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

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Вы уверены, что хотите выйти?"
        message="Вы будете перенаправлены на страницу входа."
        onConfirm={handleConfirmLogout}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default UserMenu;
