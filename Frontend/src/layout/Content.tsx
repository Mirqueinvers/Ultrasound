import React from 'react';
import Obp from '../components/researches/Obp';
import Kidney from '../components/researches/Kidney';

interface ContentProps {
  selectedStudy: string;
  activeSection: string;
}

const Content: React.FC<ContentProps> = ({ selectedStudy, activeSection }) => {
  // Показываем исследование только если выбрана секция "УЗИ протоколы"
  if (activeSection !== 'uzi-protocols') {
    return (
      <div className="content">
        <h2 className="text-slate-800 mt-0">Основной контент</h2>
        <p className="text-slate-600">Выберите "УЗИ протоколы" в меню для просмотра исследований</p>
      </div>
    );
  }

  // Если исследование не выбрано, показываем список доступных исследований
  if (!selectedStudy) {
    return (
      <div className="content">
        <h2 className="text-slate-800 mt-0">УЗИ протоколы</h2>
        <div className="mt-6">
          <p className="text-slate-600 mb-4">Выберите тип исследования из левого меню:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-slate-800 mb-2">ОБП</h4>
              <p className="text-sm text-slate-600">Органы брюшной полости</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-slate-800 mb-2">Почки</h4>
              <p className="text-sm text-slate-600">УЗИ почек и надпочечников</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-slate-800 mb-2">ОМТ (Ж)</h4>
              <p className="text-sm text-slate-600">Органы малого таза (женщины)</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-slate-800 mb-2">ОМТ (М)</h4>
              <p className="text-sm text-slate-600">Органы малого таза (мужчины)</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-slate-800 mb-2">Щитовидная железа</h4>
              <p className="text-sm text-slate-600">УЗИ щитовидной железы</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-slate-800 mb-2">Другие исследования</h4>
              <p className="text-sm text-slate-600">Молочные железы, лимфоузлы и др.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Отображаем выбранное исследование
  switch (selectedStudy) {
    case 'ОБП':
      return <Obp />;
    case 'Почки':
      return <Kidney />;
    case 'ОМТ (Ж)':
      return (
        <div className="content">
          <h2 className="text-slate-800 mt-0">УЗИ органов малого таза (женщины)</h2>
          <div className="mt-6 p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
            <h3 className="text-slate-600 mb-2">🚧 В разработке</h3>
            <p className="text-slate-500">Компонент для УЗИ ОМТ (женщины) будет добавлен в следующей версии</p>
          </div>
        </div>
      );
    case 'ОМТ (М)':
      return (
        <div className="content">
          <h2 className="text-slate-800 mt-0">УЗИ органов малого таза (мужчины)</h2>
          <div className="mt-6 p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
            <h3 className="text-slate-600 mb-2">🚧 В разработке</h3>
            <p className="text-slate-500">Компонент для УЗИ ОМТ (мужчины) будет добавлен в следующей версии</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="content">
          <h2 className="text-slate-800 mt-0">{selectedStudy}</h2>
          <div className="mt-6 p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
            <h3 className="text-slate-600 mb-2">🚧 В разработке</h3>
            <p className="text-slate-500">Компонент для "{selectedStudy}" будет добавлен в следующей версии</p>
          </div>
        </div>
      );
  }
};

export default Content;