import React from 'react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'uzi-protocols', label: 'Узи протоколы' },
    { id: 'journal', label: 'Журнал' },
    { id: 'search', label: 'Поиск' },
    { id: 'statistics', label: 'Статистика' },
    { id: 'profile', label: 'Личный кабинет' },
  ];

  return (
    <header className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <nav className="flex gap-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`text-white no-underline px-3 py-2 rounded transition-colors ${
              activeSection === item.id 
                ? 'bg-slate-600' 
                : 'hover:bg-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {/* Пустое пространство справа для баланса */}
      <div></div>
    </header>
  );
};

export default Header;