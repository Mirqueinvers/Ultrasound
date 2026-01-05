import React from 'react';
import { 
  FileText, 
  BookOpen, 
  Search, 
  BarChart3, 
  User 
} from 'lucide-react';
import UserMenu from '@/components/common/UserMenu';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { 
      id: 'uzi-protocols', 
      label: 'УЗИ протоколы',
      icon: FileText 
    },
    { 
      id: 'journal', 
      label: 'Журнал',
      icon: BookOpen 
    },
    { 
      id: 'search', 
      label: 'Поиск',
      icon: Search 
    },
    { 
      id: 'statistics', 
      label: 'Статистика',
      icon: BarChart3 
    },
    { 
      id: 'profile', 
      label: 'Личный кабинет',
      icon: User 
    },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white shadow-xl border-b border-slate-700/50 backdrop-blur-sm">
      <div className="px-8 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 mr-8">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">Ultrasound</span>
            <span className="text-xs text-slate-400">Протоколирование УЗИ</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`
                  relative group flex items-center gap-2 px-4 py-2.5 rounded-lg 
                  font-medium text-sm transition-all duration-200 
                  ${isActive 
                    ? 'bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/20' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon 
                  size={18} 
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
                <span>{item.label}</span>
                
                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side - Search + User Menu */}
        <div className="flex items-center gap-4 ml-4">
          {/* Quick Search */}
          <div className="relative group">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-sky-400 transition-colors" 
            />
            <input
              type="text"
              placeholder="Быстрый поиск..."
              className="w-64 bg-slate-700/50 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg 
                border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 
                focus:outline-none transition-all duration-200 text-sm"
            />
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
