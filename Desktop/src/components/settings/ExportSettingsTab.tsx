import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

const STORAGE_KEY = "exportTargetIp";

const ExportSettingsTab: React.FC = () => {
  const [ip, setIp] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || "";
    setIp(stored);
  }, []);

  const handleSave = () => {
    const trimmed = ip.trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, trimmed);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setIp("");
    localStorage.removeItem(STORAGE_KEY);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const storedIp = localStorage.getItem(STORAGE_KEY) || "";

  return (
    <div className="sync-tab">
      <div className="sync-tab__header">
        <h2>Экспорт</h2>
        <p className="sync-tab__subtitle">
          Настройки экспорта протоколов в MyWorkSpace
        </p>
      </div>

      <div className="sync-tab__section">
        <h3>IP-адрес компьютера MyWorkSpace</h3>
        <p className="sync-tab__desc">
          Этот адрес будет автоматически подставляться при экспорте журнала
          протоколов по сети.
        </p>

        <div className="sync-tab__grid">
          <div className="sync-tab__field">
            <label>IP-адрес:</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="sync-tab__actions">
          <button
            className="sync-tab__btn sync-tab__btn--primary"
            onClick={handleSave}
          >
            {saved ? "Сохранено" : "Сохранить"}
          </button>
          <button
            className="sync-tab__btn sync-tab__btn--secondary"
            onClick={handleClear}
            disabled={!storedIp}
          >
            Очистить
          </button>
        </div>
      </div>

      {storedIp && (
        <div className="sync-tab__section">
          <h3>Текущий сохранённый IP</h3>
          <div className="sync-tab__grid">
            <div className="sync-tab__field">
              <label>Адрес:</label>
              <span className="sync-tab__code">{storedIp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSettingsTab;