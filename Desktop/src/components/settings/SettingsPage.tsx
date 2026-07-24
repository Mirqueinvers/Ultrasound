import { useState } from "react";
import { Database, Smartphone, Upload, ChevronRight } from "lucide-react";
import ImportMappingTab from "./ImportMappingTab";
import MobileSyncTab from "./MobileSyncTab";
import ExportSettingsTab from "./ExportSettingsTab";
import "./SettingsPage.css";

type SettingsTab = "mapping" | "mobile" | "export";

const sidebarItems: { id: SettingsTab; icon: React.ReactNode; label: string }[] = [
  { id: "mobile", icon: <Smartphone size={18} />, label: "Mobile Sync" },
  { id: "mapping", icon: <Database size={18} />, label: "Импорт данных" },
  { id: "export", icon: <Upload size={18} />, label: "Экспорт" },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("mobile");

  return (
    <div className="settings-page">
      <div className="settings-page__layout">
        {/* Левая панель навигации */}
        <nav className="settings-page__sidebar">
          <div className="settings-page__sidebar-header">
            <h2>Настройки</h2>
          </div>
          <div className="settings-page__sidebar-menu">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`settings-page__sidebar-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="settings-page__sidebar-icon">{item.icon}</span>
                <span className="settings-page__sidebar-label">{item.label}</span>
                <ChevronRight size={14} className="settings-page__sidebar-chevron" />
              </button>
            ))}
          </div>
        </nav>

        {/* Правая область контента */}
        <div className="settings-page__content">
          {activeTab === "mapping" && <ImportMappingTab />}
          {activeTab === "mobile" && <MobileSyncTab />}
          {activeTab === "export" && <ExportSettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;