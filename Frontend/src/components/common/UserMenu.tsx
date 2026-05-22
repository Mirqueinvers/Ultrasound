import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-slide-up">
        <h3 className="mb-2 text-base font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mb-4 text-sm text-slate-600">{message}</p>

        <div className="mt-2 flex justify-end gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
          >
            Отмена
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-all"
          >
            Да, выйти
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
    setIsOpen(false);
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
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all duration-200 group"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-medical-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
            {getInitials(user.name)}
          </div>
          <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
            {user.name}
          </span>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-slide-down z-50">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-medical-50 to-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-medical-600 flex items-center justify-center text-lg font-bold text-white shadow-sm shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {user.email}
                  </div>
                  {user.role && (
                    <div className="text-[11px] font-medium text-medical-600 mt-1">
                      {user.role === 'admin' && 'Администратор'}
                      {user.role === 'doctor' && 'Врач УЗИ'}
                      {user.role === 'user' && 'Пользователь'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <button 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-all"
                onClick={handleProfileClick}
              >
                <User size={16} className="text-slate-400" />
                <span>Профиль</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Выход из системы"
        message="Вы уверены, что хотите выйти? Все несохранённые данные будут потеряны."
        onConfirm={handleConfirmLogout}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default UserMenu;
