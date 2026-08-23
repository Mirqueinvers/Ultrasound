import { useState } from "react";
import type { FormEvent } from "react";
import { serverConfigService } from "@services";
import "./Auth.css";

interface ServerSetupProps {
  onConfigured: () => void;
}

/**
 * Экран первичной настройки адреса центрального сервера (этап 2.5).
 * Показывается при первом запуске, когда адрес сервера ещё не сохранён.
 */
const ServerSetup: React.FC<ServerSetupProps> = ({ onConfigured }) => {
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      if (!serverConfigService.isAvailable()) {
        throw new Error("API настройки сервера недоступен");
      }

      // Нормализация: убираем завершающие слэши, добавляем схему при необходимости.
      let url = serverUrl.trim().replace(/\/+$/, "");
      if (url && !/^https?:\/\//i.test(url)) {
        url = `http://${url}`;
      }

      if (!url) {
        throw new Error("Введите адрес сервера");
      }

      const result = await serverConfigService.saveConfig({ serverUrl: url });
      if (!result.success) {
        throw new Error(result.message || "Не удалось сохранить адрес сервера");
      }

      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения адреса сервера");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Подключение к серверу</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="serverUrl">Адрес сервера</label>
            <input
              type="text"
              id="serverUrl"
              name="serverUrl"
              value={serverUrl}
              onChange={(e) => {
                if (isSubmitting) return;
                setServerUrl(e.target.value);
                setError("");
              }}
              placeholder="192.168.1.100:4000"
              required
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            Укажите адрес центрального сервера клиники (IP или имя хоста с портом).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerSetup;