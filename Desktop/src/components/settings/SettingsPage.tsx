import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ImportMappingTab from "./ImportMappingTab";
import "./SettingsPage.css";

type SettingsTab = "profile" | "mapping";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user) return null;

  return (
    <div className="settings-page">
      <div className="settings-page__container">
        <h1 className="settings-page__title">Настройки</h1>

        <div className="settings-page__tabs">
          <button
            className={`settings-page__tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Профиль
          </button>
          <button
            className={`settings-page__tab ${activeTab === "mapping" ? "active" : ""}`}
            onClick={() => setActiveTab("mapping")}
          >
            Импорт данных
          </button>
        </div>

        <div className="settings-page__content">
          {activeTab === "profile" && (
            <div className="settings-profile">
              <div className="settings-profile__section">
                <h3>Личные данные</h3>
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