import React from "react";
import { FileText, BookOpen, Search, BarChart3, BookMarked, CalendarClock, Wifi, WifiOff } from "lucide-react";
import UserMenu from "@/components/common/UserMenu";
import { useConnectionStatus } from "@/hooks";

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings?: () => void;
}

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
  {
    id: "directory",
    label: "Справочник",
    icon: BookMarked,
  },
  {
    id: "registry",
    label: "Запись",
    icon: CalendarClock,
  },
];

const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
  onNavigateToProfile,
  onNavigateToSettings,
}) => {
  const navRef = React.useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<{ left: number; width: number } | null>(null);
  const { status: connectionStatus } = useConnectionStatus();
  const isOffline = connectionStatus === "offline";
  const isNotConfigured = connectionStatus === "not-configured";
  const showConnectionWarning = isOffline || isNotConfigured;

  React.useEffect(() => {
    if (!navRef.current) return;

    const activeIndex = menuItems.findIndex((item) => item.id === activeSection);
    if (activeIndex === -1) {
      setIndicatorStyle(null);
      return;
    }

    const buttons = navRef.current.querySelectorAll<HTMLButtonElement>("button");
    const activeButton = buttons[activeIndex];
    if (!activeButton) return;

    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();

    setIndicatorStyle({
      left: btnRect.left - navRect.left + 8,
      width: btnRect.width - 16,
    });
  }, [activeSection]);

  return (
    <header className="fixed top-10 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-200">
      <div className="px-6 py-3 flex items-center max-w-[1920px] mx-auto">
        {/* Навигация по центру */}
        <nav ref={navRef} className="relative flex gap-1 flex-1 justify-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`
                  relative group flex items-center gap-2 px-4 py-2 rounded-lg 
                  font-medium text-sm transition-all duration-200
                  ${
                    isActive
                      ? "text-medical-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`transition-all duration-200 ${
                    isActive ? "text-medical-500" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Плавно перемещающийся индикатор активной секции */}
          <span
            className="absolute bottom-0 h-0.5 bg-medical-500 rounded-full transition-all duration-300 ease-in-out"
            style={
              indicatorStyle
                ? { left: indicatorStyle.left, width: indicatorStyle.width }
                : { opacity: 0 }
            }
          />
        </nav>

        {/* Статус подключения к серверу (этап 2.3) */}
        {showConnectionWarning && (
          <div
            className={`relative z-[100] ml-3 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
              isOffline
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
            title={
              isOffline
                ? "Нет связи с сервером. Доступен только просмотр кэшированных данных."
                : "Адрес сервера не настроен."
            }
          >
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>{isOffline ? "Нет связи" : "Сервер не настроен"}</span>
          </div>
        )}

        {/* User Menu */}
        <div className="relative z-[100] ml-4">
          <UserMenu onNavigateToProfile={onNavigateToProfile} onNavigateToSettings={onNavigateToSettings} />
        </div>
      </div>
    </header>
  );
};

export default Header;
