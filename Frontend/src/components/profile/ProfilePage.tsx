import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/contexts/AuthContext';
import type { MobileHostStatus } from '@/types/electron';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedOrganization, setEditedOrganization] = useState(user?.organization || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
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

  const handleSaveProfile = async () => {
  try {
    setError('');
    setSuccess('');

    if (!editedName.trim()) {
      setError('Имя не может быть пустым');
      return;
    }

    if (!window.authAPI) {
      throw new Error('Auth API недоступен');
    }

    const response = await window.authAPI.updateUser({
      id: parseInt(user!.id),
      name: editedName,
      username: editedEmail,
      organization: editedOrganization || undefined,
    });

    if (!response.success) {
      throw new Error(response.message || 'Ошибка обновления профиля');
    }

    // Вызываем updateUser, который теперь перезагрузит данные из БД
    await updateUser({
      ...user!,
      name: editedName,
      email: editedEmail,
      organization: editedOrganization || undefined,
    });

    setIsEditing(false);
    setSuccess('Профиль успешно обновлен');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Произошла ошибка');
  }
};


  const handleChangePassword = async () => {
    try {
      setError('');
      setSuccess('');

      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Заполните все поля');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Новые пароли не совпадают');
        return;
      }

      if (newPassword.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
      }

      if (!window.authAPI) {
        throw new Error('Auth API недоступен');
      }

      const response = await window.authAPI.changePassword({
        userId: parseInt(user!.id),
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || 'Ошибка смены пароля');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setSuccess('Пароль успешно изменен');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setEditedOrganization(user?.organization || '');
    setIsEditing(false);
    setError('');
  };

  const handleCancelPasswordChange = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
    setError('');
  };

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
    setSuccess('Адрес подключения скопирован');
  };

  const handleCopyMobilePayload = async () => {
    if (!mobileSyncPayload) {
      return;
    }

    await navigator.clipboard.writeText(mobileSyncPayload);
    setSuccess('QR payload скопирован');
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-page__container">
        <h1 className="profile-page__title">Профиль пользователя</h1>

        {error && <div className="profile-page__error">{error}</div>}
        {success && <div className="profile-page__success">{success}</div>}

        {/* Информация о профиле */}
        <div className="profile-page__section">
          <div className="profile-page__header">
            <div className="profile-page__avatar">
              {getInitials(user.name)}
            </div>
            <div className="profile-page__info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              {user.organization && (
                <p className="profile-page__organization">🏢 {user.organization}</p>
              )}
              {user.role && (
                <span className="profile-page__role">
                  {user.role === 'admin' && '👑 Администратор'}
                  {user.role === 'doctor' && '👨‍⚕️ Врач'}
                  {user.role === 'user' && '👤 Пользователь'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Редактирование профиля */}
        <div className="profile-page__section">
          <h3>Личные данные</h3>
          
          {!isEditing ? (
            <div className="profile-page__data">
              <div className="profile-page__field">
                <label>Имя:</label>
                <span>{user.name}</span>
              </div>
              <div className="profile-page__field">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="profile-page__field">
                <label>Организация:</label>
                <span>{user.organization || 'Не указана'}</span>
              </div>
              <button 
                className="profile-page__button"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </button>
            </div>
          ) : (
            <div className="profile-page__form">
              <div className="profile-page__input-group">
                <label htmlFor="name">Имя</label>
                <input
                  id="name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Введите имя"
                />
              </div>
              <div className="profile-page__input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  placeholder="Введите email"
                />
              </div>
              <div className="profile-page__input-group">
                <label htmlFor="organization">Организация</label>
                <input
                  id="organization"
                  type="text"
                  value={editedOrganization}
                  onChange={(e) => setEditedOrganization(e.target.value)}
                  placeholder="Введите название организации"
                />
              </div>
              <div className="profile-page__actions">
                <button 
                  className="profile-page__button profile-page__button--primary"
                  onClick={handleSaveProfile}
                >
                  Сохранить
                </button>
                <button 
                  className="profile-page__button profile-page__button--secondary"
                  onClick={handleCancelEdit}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Смена пароля */}
        <div className="profile-page__section">
          <h3>Безопасность</h3>
          
          {!isChangingPassword ? (
            <button 
              className="profile-page__button"
              onClick={() => setIsChangingPassword(true)}
            >
              Изменить пароль
            </button>
          ) : (
            <div className="profile-page__form">
              <div className="profile-page__input-group">
                <label htmlFor="currentPassword">Текущий пароль</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                />
              </div>
              <div className="profile-page__input-group">
                <label htmlFor="newPassword">Новый пароль</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                />
              </div>
              <div className="profile-page__input-group">
                <label htmlFor="confirmPassword">Подтвердите пароль</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                />
              </div>
              <div className="profile-page__actions">
                <button 
                  className="profile-page__button profile-page__button--primary"
                  onClick={handleChangePassword}
                >
                  Сохранить пароль
                </button>
                <button 
                  className="profile-page__button"
                  onClick={handleCancelPasswordChange}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-page__section">
          <h3>Mobile Sync</h3>

          {mobileHostError && (
            <div className="profile-page__error">{mobileHostError}</div>
          )}

          <div className="profile-page__data">
            <div className="profile-page__field">
              <label>Статус:</label>
              <span>{mobileHostStatus?.running ? 'Запущен' : 'Остановлен'}</span>
            </div>
            <div className="profile-page__field">
              <label>HTTP:</label>
              <span>{mobileHostStatus?.httpUrl || 'Не доступен'}</span>
            </div>
            <div className="profile-page__field">
              <label>WS:</label>
              <span>{mobileHostStatus?.wsUrl || 'Не доступен'}</span>
            </div>
            <div className="profile-page__field">
              <label>Код:</label>
              <span>{mobileHostStatus?.pairingCode || 'Не доступен'}</span>
            </div>
            <div className="profile-page__field">
              <label>Draft:</label>
              <span>{mobileHostStatus?.draftActive ? 'Active' : 'Idle'}</span>
            </div>
            <div className="profile-page__field">
              <label>Active protocol:</label>
              <span>{mobileHostStatus?.activeStudyLabel || 'None'}</span>
            </div>
            <div className="profile-page__field">
              <label>Устройств:</label>
              <span>{mobileHostStatus?.clients ?? 0}</span>
            </div>
            <div className="profile-page__field">
              <label>Адреса:</label>
              <span>
                {mobileHostStatus?.addresses?.length
                  ? mobileHostStatus.addresses.join(', ')
                  : 'Не обнаружены'}
              </span>
            </div>
          </div>

          <div className="profile-page__actions">
            <button
              className="profile-page__button profile-page__button--primary"
              onClick={handleRestartMobileHost}
              disabled={isMobileHostBusy}
            >
              {isMobileHostBusy ? 'Обновление...' : 'Перезапустить host'}
            </button>
            <button
              className="profile-page__button profile-page__button--secondary"
              onClick={handleCopyMobileUrl}
              disabled={!mobileHostStatus?.httpUrl}
            >
              Скопировать адрес
            </button>
          </div>

          <div className="profile-page__qr">
            <div className="profile-page__qr-card">
              <div className="profile-page__qr-head">
                <div>
                  <h4>Подключение с телефона</h4>
                  <p>
                    Сканируй QR-код в mobile-приложении, чтобы сразу подставить адрес хоста и pairing code.
                  </p>
                </div>
                <span className="profile-page__qr-badge">
                  {mobileHostStatus?.running ? 'Live' : 'Offline'}
                </span>
              </div>

              {mobileSyncQr ? (
                <div className="profile-page__qr-imageWrap">
                  <img
                    className="profile-page__qr-image"
                    src={mobileSyncQr}
                    alt="QR code for Ultrasound mobile sync"
                  />
                </div>
              ) : (
                <div className="profile-page__qr-placeholder">
                  QR-код появится, когда host будет запущен и получит адрес в сети.
                </div>
              )}

              <div className="profile-page__qr-meta">
                <div className="profile-page__field">
                  <label>Payload:</label>
                  <span>{mobileSyncPayload || 'Недоступен'}</span>
                </div>
                <div className="profile-page__actions">
                  <button
                    className="profile-page__button profile-page__button--secondary"
                    onClick={handleCopyMobilePayload}
                    disabled={!mobileSyncPayload}
                  >
                    Скопировать payload
                  </button>
                  <button
                    className="profile-page__button profile-page__button--secondary"
                    onClick={handleCopyMobileUrl}
                    disabled={!mobileHostStatus?.httpUrl}
                  >
                    Скопировать адрес
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
