import { useState } from "react";
import {
  getExportTargetIps,
  setExportTargetIps,
} from "@/utils/exportTargetIps";

const ExportSettingsTab: React.FC = () => {
  const [addresses, setAddresses] = useState<string[]>(() => {
    const stored = getExportTargetIps();
    return stored.length > 0 ? stored : [""];
  });
  const [saved, setSaved] = useState(false);

  const handleAddressChange = (index: number, value: string) => {
    setAddresses((current) =>
      current.map((address, i) => (i === index ? value : address)),
    );
  };

  const handleAddAddress = () => {
    setAddresses((current) => [...current, ""]);
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses((current) =>
      current.length === 1 ? [""] : current.filter((_, i) => i !== index),
    );
  };

  const handleSave = () => {
    setExportTargetIps(addresses);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setAddresses([""]);
    setExportTargetIps([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const storedIps = getExportTargetIps();

  return (
    <div className="sync-tab">
      <div className="sync-tab__header">
        <h2>Экспорт</h2>
        <p className="sync-tab__subtitle">
          Настройки экспорта протоколов в MyWorkSpace
        </p>
      </div>

      <div className="sync-tab__section">
        <h3>IP-адреса компьютеров MyWorkSpace</h3>
        <p className="sync-tab__desc">
          Сохраните несколько адресов, если компьютеры с MyWorkSpace могут быть
          доступны по разным IP. При экспорте журнала протоколов по сети можно
          будет выбрать нужный адрес.
        </p>

        <div className="sync-tab__grid">
          {addresses.map((address, index) => (
            <div key={index} className="sync-tab__field">
              <label>IP-адрес {addresses.length > 1 ? `№${index + 1}` : ""}:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) =>
                    handleAddressChange(index, e.target.value)
                  }
                  placeholder="192.168.1.100"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(index)}
                    className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                    title="Удалить адрес"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddAddress}
          className="mt-2 rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm transition hover:bg-sky-100"
        >
          + Добавить адрес
        </button>

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
            disabled={storedIps.length === 0}
          >
            Очистить
          </button>
        </div>
      </div>

      {storedIps.length > 0 && (
        <div className="sync-tab__section">
          <h3>Сохранённые адреса</h3>
          <div className="sync-tab__grid">
            {storedIps.map((ip) => (
              <div key={ip} className="sync-tab__field">
                <label>Адрес:</label>
                <span className="sync-tab__code">{ip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSettingsTab;