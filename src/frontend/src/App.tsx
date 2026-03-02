import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLoginScreen } from "@/components/AdminLoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { LoginScreen } from "@/components/LoginScreen";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

type AppView = "login" | "dashboard" | "adminLogin" | "adminDashboard";

function getInitialUserMobile(): string {
  return localStorage.getItem("userMobile") || "";
}

function getInitialView(): AppView {
  if (localStorage.getItem("adminSession") === "true") {
    return "adminDashboard";
  }
  if (localStorage.getItem("userMobile")) {
    return "dashboard";
  }
  return "login";
}

export default function App() {
  const [view, setView] = useState<AppView>(getInitialView);
  const [loggedInMobile, setLoggedInMobile] =
    useState<string>(getInitialUserMobile);

  function handleLoginSuccess(mobile: string) {
    localStorage.setItem("userMobile", mobile);
    setLoggedInMobile(mobile);
    setView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("userMobile");
    setLoggedInMobile("");
    setView("login");
  }

  function handleAdminLogin() {
    localStorage.setItem("adminSession", "true");
    setView("adminDashboard");
  }

  function handleAdminLogout() {
    localStorage.removeItem("adminSession");
    setView("adminLogin");
  }

  return (
    <>
      {view === "login" && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onAdminLogin={() => setView("adminLogin")}
        />
      )}
      {view === "dashboard" && (
        <Dashboard mobile={loggedInMobile} onLogout={handleLogout} />
      )}
      {view === "adminLogin" && (
        <AdminLoginScreen
          onAdminLogin={handleAdminLogin}
          onBackToUser={() => setView("login")}
        />
      )}
      {view === "adminDashboard" && (
        <AdminDashboard onLogout={handleAdminLogout} />
      )}
      <Toaster position="top-center" richColors />
    </>
  );
}
