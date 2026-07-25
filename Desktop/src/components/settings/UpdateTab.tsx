import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, AlertCircle, CheckCircle, RotateCw } from "lucide-react";
import "./UpdateTab.css";

declare global {
  interface Window {
    updateAPI: {
      check: () => Promise<void>;
      download: () => Promise<void>;
      install: () => Promise<void>;
      onUpdateAvailable: (handler: (info: { version: string }) => void) => () => void;
      onUpdateNotAvailable: (handler: (info: { version: string }) => void) => () => void;
      onDownloadProgress: (handler: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => () => void;
      onUpdateDownloaded: (handler: (info: { version: string }) => void) => () => void;
      onUpdateError: (handler: (error: { message: string }) => void) => () => void;
    };
  }
}

type UpdateState = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error" | "not-available";

const UpdateTab: React.FC = () => {
  const [state, setState] = useState<UpdateState>("idle");
  const [progress, setProgress] = useState(0);
  const [version, setVersion] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const api = window.updateAPI;
    if (!api) return;

    const unsub1 = api.onUpdateAvailable((info) => {
      setState("available");
      setVersion(info.version);
      setProgress(0);
    });
    const unsub2 = api.onUpdateNotAvailable(() => {
      setState("not-available");
    });
    const unsub3 = api.onDownloadProgress((p) => {
      setState("downloading");
      setProgress(Math.round(p.percent));
    });
    const unsub4 = api.onUpdateDownloaded((info) => {
      setState("downloaded");
      setVersion(info.version);
      setProgress(100);
    });
    const unsub5 = api.onUpdateError((err) => {
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
    if (!window.updateAPI) return;
    setState("checking");
    setErrorMsg("");
    window.updateAPI.check();
  }, []);

  const handleDownload = useCallback(() => {
    if (!window.updateAPI) return;
    window.updateAPI.download();
  }, []);

  const handleInstall = useCallback(() => {
    if (!window.updateAPI) return;
    window.updateAPI.install();
  }, []);

  return (
    <div className="update-tab">
      <div className="update-tab__header">
        <h3>Обновление программы</h3>
        <p className="update-tab__description">
          Проверьте наличие новой версии и установите обновление
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