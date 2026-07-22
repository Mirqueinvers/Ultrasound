import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import type { MobileHostStatus } from '@/types/electron';
import './MobileSyncTab.css';

const MobileSyncTab: React.FC = () => {
  const [mobileHostStatus, setMobileHostStatus] = useState<MobileHostStatus | null>(null);
  const [mobileHostError, setMobileHostError] = useState<string>('');
  const [isMobileHostBusy, setIsMobileHostBusy] = useState(false);
  const [mobileSyncQr, setMobileSyncQr] = useState<string>('');

  const mobileSyncPayload = useMemo(() => {
    if (!mobileHostStatus?.httpUrl || !mobileHostStatus?.pairingCode) {
      return '';
    }

    const payloadUrl = new URL('ultrasound-mobile://connect');
    payloadUrl.searchParams.set('host', mobileHostStatus.httpUrl);
    payloadUrl.searchParams.set('code', mobileHostStatus.pairingCode);
    return payloadUrl.toString();
  }, [mobileHostStatus?.httpUrl, mobileHostStatus?.pairingCode]);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        if (!window.mobileHostAPI) {
          return;
        }

        const status = await window.mobileHostAPI.getStatus();
        if (!cancelled) {
          setMobileHostStatus(status);
          setMobileHostError('');
        }
      } catch (err) {
        if (!cancelled) {
          setMobileHostError(err instanceof Error ? err.message : 'Не удалось получить статус mobile sync');
        }
      }
    };

    loadStatus();
    const interval = window.setInterval(loadStatus, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderQr = async () => {
      if (!mobileSyncPayload) {
        setMobileSyncQr('');
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(mobileSyncPayload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 256,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        if (!cancelled) {
          setMobileSyncQr(dataUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setMobileHostError(err instanceof Error ? err.message : 'Не удалось сгенерировать QR-код');
        }
      }
    };

    renderQr();

    return () => {
      cancelled = true;
    };
  }, [mobileSyncPayload]);

  const handleRestartMobileHost = async () => {
    try {
      setIsMobileHostBusy(true);
      setMobileHostError('');

      if (!window.mobileHostAPI) {
        throw new Error('Mobile host API недоступен');
      }

      const status = await window.mobileHostAPI.restart();
      setMobileHostStatus(status);
    } catch (err) {
      setMobileHostError(err instanceof Error ? err.message : 'Не удалось перезапустить mobile host');
    } finally {
      setIsMobileHostBusy(false);
    }
  };

  const handleCopyMobileUrl = async () => {
    if (!mobileHostStatus?.httpUrl) {
      return;
    }

    await navigator.clipboard.writeText(mobileHostStatus.httpUrl);
  };

  const handleCopyMobilePayload = async () => {
    if (!mobileSyncPayload) {
      return;
    }

    await navigator.clipboard.writeText(mobileSyncPayload);
  };

  return (
    <div className="sync-tab">
      <div className="sync-tab__header">
        <h2>Mobile Sync</h2>
        <p className="sync-tab__subtitle">Синхронизация с мобильным приложением</p>
      </div>

      {mobileHostError && (
        <div className="sync-tab__error">{mobileHostError}</div>
      )}

      <div className="sync-tab__section">
        <h3>Статус подключения</h3>
        <div className="sync-tab__grid">
          <div className="sync-tab__field">
            <label>Статус:</label>
            <span className={mobileHostStatus?.running ? 'sync-tab__status--active' : 'sync-tab__status--inactive'}>
              {mobileHostStatus?.running ? 'Запущен' : 'Остановлен'}
            </span>
          </div>
          <div className="sync-tab__field">
            <label>HTTP:</label>
            <span>{mobileHostStatus?.httpUrl || 'Не доступен'}</span>
          </div>
          <div className="sync-tab__field">
            <label>WS:</label>
            <span>{mobileHostStatus?.wsUrl || 'Не доступен'}</span>
          </div>
          <div className="sync-tab__field">
            <label>Код:</label>
            <span className="sync-tab__code">{mobileHostStatus?.pairingCode || 'Не доступен'}</span>
          </div>
          <div className="sync-tab__field">
            <label>Draft:</label>
            <span>{mobileHostStatus?.draftActive ? 'Active' : 'Idle'}</span>
          </div>
          <div className="sync-tab__field">
            <label>Active protocol:</label>
            <span>{mobileHostStatus?.activeStudyLabel || 'None'}</span>
          </div>
          <div className="sync-tab__field">
            <label>Устройств:</label>
            <span>{mobileHostStatus?.clients ?? 0}</span>
          </div>
          <div className="sync-tab__field">
            <label>Адреса:</label>
            <span>
              {mobileHostStatus?.addresses?.length
                ? mobileHostStatus.addresses.join(', ')
                : 'Не обнаружены'}
            </span>
          </div>
        </div>

        <div className="sync-tab__actions">
          <button
            className="sync-tab__btn sync-tab__btn--primary"
            onClick={handleRestartMobileHost}
            disabled={isMobileHostBusy}
          >
            {isMobileHostBusy ? 'Обновление...' : 'Перезапустить host'}
          </button>
          <button
            className="sync-tab__btn sync-tab__btn--secondary"
            onClick={handleCopyMobileUrl}
            disabled={!mobileHostStatus?.httpUrl}
          >
            Скопировать адрес
          </button>
        </div>
      </div>

      <div className="sync-tab__section">
        <h3>Подключение с телефона</h3>
        <p className="sync-tab__desc">
          Сканируй QR-код в mobile-приложении, чтобы сразу подставить адрес хоста и pairing code.
        </p>

        <div className="sync-tab__qr">
          {mobileSyncQr ? (
            <img
              className="sync-tab__qr-image"
              src={mobileSyncQr}
              alt="QR code for Ultrasound mobile sync"
            />
          ) : (
            <div className="sync-tab__qr-placeholder">
              QR-код появится, когда host будет запущен и получит адрес в сети.
            </div>
          )}
        </div>

        <div className="sync-tab__field">
          <label>Payload:</label>
          <span className="sync-tab__code">{mobileSyncPayload || 'Недоступен'}</span>
        </div>

        <div className="sync-tab__actions">
          <button
            className="sync-tab__btn sync-tab__btn--secondary"
            onClick={handleCopyMobilePayload}
            disabled={!mobileSyncPayload}
          >
            Скопировать payload
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSyncTab;