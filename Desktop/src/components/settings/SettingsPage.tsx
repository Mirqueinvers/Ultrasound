import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Database, ChevronRight } from "lucide-react";
import ImportMappingTab from "./ImportMappingTab";
import "./SettingsPage.css";

type SettingsTab = "profile" | "mapping";

const sidebarItems: { id: SettingsTab; icon: React.ReactNode; label: string }[] = [
  { id: "profile", icon: <User size={18} />, label: "Профиль" },
  { id: "mapping", icon: <Database size={18} />, label: "Импорт данных" },
];

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user) return null;

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
          {activeTab === "profile" && (
            <div className="settings-profile">
              <div className="settings-profile__header">
                <h2>Профиль пользователя</h2>
                <p className="settings-profile__subtitle">Личная информация и данные учётной записи</p>
              </div>
              <div className="settings-profile__section">
                <div className="settings-profile__data">
                  <div className="settings-profile__field">
                    <label>Имя:</label>
                    <span>{user.name}</span>
                  </div>
                  <div className="settings-profile__field">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  {user.organization && (
                    <div className="settings-profile__field">
                      <label>Организация:</label>
                      <span>{user.organization}</span>
                    </div>
                  )}
                  {user.role && (
                    <div className="settings-profile__field">
                      <label>Роль:</label>
                      <span>
                        {user.role === "admin" && "Администратор"}
                        {user.role === "doctor" && "Врач УЗИ"}
                        {user.role === "user" && "Пользователь"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "mapping" && <ImportMappingTab />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;