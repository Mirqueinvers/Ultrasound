import React from "react";
import { FileText, BookOpen, Search, BarChart3 } from "lucide-react";
import UserMenu from "@/components/common/UserMenu";

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onNavigateToProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
  onNavigateToProfile,
}) => {
  const menuItems = [
    {
      id: "uzi-protocols",
      label: "УЗИ протоколы",
      icon: FileText,
    },
    {
      id: "journal",
      label: "Журнал",
      icon: BookOpen,
    },
    {
      id: "search",
      label: "Поиск",
      icon: Search,
    },
    {
      id: "statistics",
      label: "Статистика",
      icon: BarChart3,
    },
    // новый пункт Test (справа от Статистика)
    {
      id: "test",
      label: "Test",
      icon: FileText,
    },
  ];

  return (
    <header className="relative z-50 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white shadow-xl border-b border-slate-700/50 rounded-2xl backdrop-blur-sm">
      <div className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 mr-8">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">
              Ultrasound
            </span>
            <span className="text-xs text-slate-400">
              Протоколирование УЗИ
            </span>
          </div>
        </div>

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
                  ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/20"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span>{item.label}</span>

                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="relative z-[100]">
          <UserMenu onNavigateToProfile={onNavigateToProfile} />
        </div>
      </div>
    </header>
  );
};

export default Header;
