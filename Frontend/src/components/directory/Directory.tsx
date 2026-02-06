// src/components/directory
import React from "react";
import Orads from "./Orads";
import Birads from "./Birads";
import Tirads from "./Tirads";

interface DirectoryProps {
  selectedDirectoryItem?: string;
}

const Directory: React.FC<DirectoryProps> = ({ selectedDirectoryItem = "" }) => {
  const renderDefaultContent = () => (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Справочник</h3>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-600 text-sm">
          Выберите раздел справочника из левой панели для просмотра информации.
        </p>
      </div>
    </div>
  );

  const renderPlaceholderContent = (title: string) => (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-600 text-sm">
          Этот раздел находится в разработке. Информация будет добавлена позже.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedDirectoryItem) {
      case "TI-RADS":
        return <Tirads />;
      case "O-RADS":
        return <Orads />;
      case "BI-RADS":
        return <Birads />;
      case "Размеры щитовидной железы":
        return renderPlaceholderContent("Размеры щитовидной железы");
      case "Нормы ОБП":
        return renderPlaceholderContent("Нормы ОБП");
      case "Нормы почек":
        return renderPlaceholderContent("Нормы почек");
      case "Размеры молочных желез":
        return renderPlaceholderContent("Размеры молочных желез");
      default:
        return renderDefaultContent();
    }
  };

  return (
    <div className="content">
      {renderContent()}
    </div>
  );
};

export default Directory;



