import { useEffect, useState } from "react";
import { AuthProvider } from "@contexts/AuthProvider";
import { useAuth } from "@contexts/useAuth";
import { serverConfigService } from "@services";

import AuthForm from "@/components/auth/AuthForm";
import ServerSetup from "@/components/auth/ServerSetup";
import AppShell, { AppTitlebar } from "@/app/AppShell";

function AppContent() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [configChecked, setConfigChecked] = useState(false);
  const [isServerConfigured, setIsServerConfigured] = useState(true);

  // Этап 2.5: при старте проверяем, настроен ли адрес центрального сервера.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!serverConfigService.isAvailable()) {
        setConfigChecked(true);
        return;
      }
      try {
        const config = await serverConfigService.getConfig();
        if (!cancelled) {
          setIsServerConfigured(config.configured);
        }
      } catch {
        if (!cancelled) {
          setIsServerConfigured(false);
        }
      } finally {
        if (!cancelled) {
          setConfigChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading || !configChecked) {
    return (
      <>
        <AppTitlebar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Загрузка...
        </div>
      </>
    );
  }

  if (!isServerConfigured) {
    return <ServerSetup onConfigured={() => setIsServerConfigured(true)} />;
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        onLogin={login}
        onRegister={register}
        onServerSetup={() => setIsServerConfigured(false)}
      />
    );
  }

  return <AppShell />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;