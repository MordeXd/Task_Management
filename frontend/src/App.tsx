import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "@/store";
import { api, setupApiInterceptors } from "@/services/api";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleGuard } from "@/components/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SuperAdminPage } from "@/pages/SuperAdminPage";
import { AdminPage } from "@/pages/AdminPage";
import { MyTasksPage } from "@/pages/MyTasksPage";
import { TeamTasksPage } from "@/pages/TeamTasksPage";
import { CompletedTasksPage } from "@/pages/CompletedTasksPage";
import { TaskDetailPage } from "@/pages/TaskDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { GroupTasksPage } from "@/pages/GroupTasksPage";
import { GroupTaskDetailPage } from "@/pages/GroupTaskDetailPage";
import { CompletedGroupTasksPage } from "@/pages/CompletedGroupTasksPage";
import { SuperAdminDashboardPage } from "@/pages/SuperAdminDashboardPage";
import { AdminEmployeesPage } from "@/pages/AdminEmployeesPage";
import { SuperAdminEmployeeDetailPage } from "@/pages/SuperAdminEmployeeDetailPage";
import { SuperAdminEmployeeProfilePage } from "@/pages/SuperAdminEmployeeProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

setupApiInterceptors(store);

function AppRoutes() {
  const theme = store.getState().ui.theme;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route element={<RoleGuard roles={["admin", "employee"]} />}>
              <Route path="/my-tasks" element={<MyTasksPage />} />
            </Route>
            <Route element={<RoleGuard roles={["admin", "super_admin"]} />}>
              <Route path="/team-tasks" element={<TeamTasksPage />} />
            </Route>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/completed-tasks" element={<CompletedTasksPage />} />
            <Route element={<RoleGuard roles={["super_admin"]} />}>
              <Route path="/super-admin" element={<SuperAdminPage />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
              <Route path="/super-admin/admins/:adminId/employees" element={<AdminEmployeesPage />} />
              <Route path="/super-admin/employees/:employeeId" element={<SuperAdminEmployeeDetailPage />} />
              <Route path="/super-admin/employees/:employeeId/profile" element={<SuperAdminEmployeeProfilePage />} />
            </Route>
            <Route element={<RoleGuard roles={["admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route element={<RoleGuard roles={["admin", "super_admin", "employee"]} />}>
              <Route path="/group-tasks" element={<GroupTasksPage />} />
              <Route path="/group-tasks/:id" element={<GroupTaskDetailPage />} />
            </Route>
            <Route path="/completed-group-tasks" element={<CompletedGroupTasksPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}

function GlobalErrorLogger() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      console.error("[GlobalError]", event.error || event.message);
      api.post("/api/errors/client", {
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }).catch(() => {});
    };
    const rejection = (event: PromiseRejectionEvent) => {
      console.error("[UnhandledRejection]", event.reason);
      api.post("/api/errors/client", {
        message: String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }).catch(() => {});
    };
    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", rejection);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", rejection);
    };
  }, []);
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <GlobalErrorLogger />
        <AppRoutes />
      </ErrorBoundary>
    </Provider>
  );
}
