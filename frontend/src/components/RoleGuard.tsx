import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import type { UserRole } from "@/types";

export function RoleGuard({ roles }: { roles: UserRole[] }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}



