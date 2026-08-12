import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, AlertCircle, CheckCircle, RotateCw, Server, Plus, Trash2 } from "lucide-react";
import { updateService } from "@services";
import "./UpdateTab.css";

type UpdateState = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error" | "not-available";

interface UpdateServer {
  name: string;
  ip: string;
}

// Очистка ввода: убираем IP:, http://, слэши и порт :8080, оставляем только IP
function cleanIpInput(raw: string): string {
  return raw
    .replace(/^IP\s*:\s*/i, "")
    .replace(/^http:\/\//i, "")
    .replace(/\/+$/, "")
    .replace(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/, "$1")
    .trim();
}

const UpdateTab: React.FC = () => {
  const [state, setState] = useState<UpdateState>("idle");
  const [progress, setProgress] = useState(0);
  const [version, setVersion] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Серверы обновлений
  const [servers, setServers] = useState<UpdateServer[]>([]);
  const [activeIp, setActiveIp] = useState("");
  const [newServerName, setNewServerName] = useState("");
  const [newServerIp, setNewServerIp] = useState("");

  // Загрузка сохранённых серверов
  useEffect(() => {
    if (!updateService.isAvailable()) return;

    updateService.getServers().then((stored) => {
      if (Array.isArray(stored)) {
        setServers(stored);
      }
    }).catch(() => {});

    updateService.getActiveServer().then((ip) => {
      setActiveIp(ip || "");
    }).catch(() => {});
  }, []);

  const persistServers = useCallback((updated: UpdateServer[]) => {
    updateService.saveServers(updated).catch(() => {});
  }, []);

  const handleAddServer = () => {
    const cleanedIp = cleanIpInput(newServerIp);
    if (!cleanedIp) return;
    if (servers.some((s) => s.ip === cleanedIp)) return;
    const name = newServerName.trim() || cleanedIp;
    const updated = [...servers, { name, ip: cleanedIp }];
    setServers(updated);
    persistServers(updated);
    setNewServerName("");
    setNewServerIp("");
  };

  const handleRemoveServer = (server: UpdateServer) => {
    const updated = servers.filter((s) => s.ip !== server.ip);
    setServers(updated);
    persistServers(updated);
    if (activeIp === server.ip) {
      setActiveIp("");
      updateService.setActiveServer("").catch(() => {});
    }
  };

  const handleSelectActive = (server: UpdateServer) => {
    setActiveIp(server.ip);
    updateService.setActiveServer(server.ip).catch(() => {});
  };

  useEffect(() => {
    if (!updateService.isAvailable()) return;

    const unsub1 = updateService.onUpdateAvailable((info) => {
      setState("available");
      setVersion(info.version);
      setProgress(0);
    });
    const unsub2 = updateService.onUpdateNotAvailable(() => {
      setState("not-available");
    });
    const unsub3 = updateService.onDownloadProgress((p) => {
      setState("downloading");
      setProgress(Math.round(p.percent));
    });
    const unsub4 = updateService.onUpdateDownloaded((info) => {
      setState("downloaded");
      setVersion(info.version);
      setProgress(100);
    });
    const unsub5 = updateService.onUpdateError((err) => {
      setState("error");
      setErrorMsg(err.message);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, []);

  const handleCheck = useCallback(() => {
    if (!updateService.isAvailable()) return;
    setState("checking");
    setErrorMsg("");
    updateService.check();
  }, []);

  const handleDownload = useCallback(() => {
    if (!updateService.isAvailable()) return;
    updateService.download();
  }, []);

  const handleInstall = useCallback(() => {
    if (!updateService.isAvailable()) return;
    updateService.install();
  }, []);

  return (
    <div className="update-tab">
      <div className="update-tab__header">
        <h3>Обновление программы</h3>
        <p className="update-tab__description">
          Проверьте наличие новой версии и установите обновление
        </p>
      </div>

      {/* Блок выбора сервера обновлений */}
      <div className="update-tab__servers">
        <div className="update-tab__servers-header">
          <Server size={16} />
          <span>Сервер обновлений</span>
        </div>

        <div className="update-tab__servers-list">
          {servers.length === 0 && (
            <p className="update-tab__servers-empty">
              Список пуст. Добавьте IP-адрес сервера обновлений.
            </p>
          )}
          {servers.map((server) => (
            <div
              key={server.ip}
              className={`update-tab__server-item ${
                activeIp === server.ip ? "update-tab__server-item--active" : ""
              }`}
              onClick={() => handleSelectActive(server)}
            >
              <div className="update-tab__server-radio" />
              <div className="update-tab__server-info">
                <p className="update-tab__server-name">{server.name}</p>
                <p className="update-tab__server-ip">{server.ip}</p>
              </div>
              <button
                className="update-tab__server-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveServer(server);
                }}
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="update-tab__server-add">
          <input
            type="text"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddServer()}
            placeholder="Название (необязательно)"
            className="update-tab__input"
          />
          <input
            type="text"
            value={newServerIp}
            onChange={(e) => setNewServerIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddServer()}
            placeholder="192.168.1.100"
            className="update-tab__input"
          />
          <button
            className="update-tab__btn update-tab__btn--add"
            onClick={handleAddServer}
            title="Добавить сервер"
          >
            <Plus size={16} />
            Добавить
          </button>
        </div>

        <p className="update-tab__servers-hint">
          Порт 8080 подставляется автоматически. Выбранный сервер используется при проверке обновлений.
        </p>
      </div>

      <div className="update-tab__status">
        {state === "idle" && (
          <div className="update-tab__status-icon update-tab__status-icon--idle">
            <RefreshCw size={48} />
          </div>
        )}
        {state === "checking" && (
          <div className="update-tab__status-icon update-tab__status-icon--checking">
            <RotateCw size={48} className="update-tab__spinner" />
          </div>
        )}
        {state === "available" && (
          <div className="update-tab__status-icon update-tab__status-icon--available">
            <Download size={48} />
          </div>
        )}
        {state === "downloading" && (
          <div className="update-tab__status-icon update-tab__status-icon--downloading">
            <Download size={48} />
          </div>
        )}
        {state === "downloaded" && (
          <div className="update-tab__status-icon update-tab__status-icon--success">
            <CheckCircle size={48} />
          </div>
        )}
        {state === "error" && (
          <div className="update-tab__status-icon update-tab__status-icon--error">
            <AlertCircle size={48} />
          </div>
        )}
        {state === "not-available" && (
          <div className="update-tab__status-icon update-tab__status-icon--success">
            <CheckCircle size={48} />
          </div>
        )}

        <div className="update-tab__status-text">
          {state === "idle" && "Нажмите «Проверить», чтобы узнать о наличии обновлений"}
          {state === "checking" && "Проверка обновлений..."}
          {state === "available" && `Доступна версия ${version}`}
          {state === "downloading" && `Загрузка... ${progress}%`}
          {state === "downloaded" && `Версия ${version} загружена. Установить?`}
          {state === "error" && `Ошибка: ${errorMsg}`}
          {state === "not-available" && "У вас актуальная версия"}
        </div>

        {state === "downloading" && (
          <div className="update-tab__progress-bar">
            <div
              className="update-tab__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="update-tab__actions">
        {(state === "idle" || state === "error" || state === "not-available") && (
          <button
            className="update-tab__btn update-tab__btn--primary"
            onClick={handleCheck}
          >
            <RefreshCw size={16} />
            Проверить
          </button>
        )}
        {state === "available" && (
          <button
            className="update-tab__btn update-tab__btn--primary"
            onClick={handleDownload}
          >
            <Download size={16} />
            Скачать
          </button>
        )}
        {state === "downloaded" && (
          <button
            className="update-tab__btn update-tab__btn--install"
            onClick={handleInstall}
          >
            <RotateCw size={16} />
            Установить
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateTab;