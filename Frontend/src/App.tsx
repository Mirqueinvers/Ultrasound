import { AuthProvider, useAuth } from "@contexts/AuthContext";

import AuthForm from "@/components/auth/AuthForm";
import AppShell, { AppTitlebar } from "@/app/AppShell";

function AppContent() {
  const { isAuthenticated, isLoading, login, register } = useAuth();

  if (isLoading) {
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

  if (!isAuthenticated) {
    return (
      <AuthForm
        onLogin={login}
        onRegister={register}
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
