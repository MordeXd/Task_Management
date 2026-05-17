import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Group,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCircle,
  UserCog,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logout } from "@/store/authSlice";
import { setSidebarOpen, toggleTheme } from "@/store/uiSlice";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const navItems: { to: string; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "employee"] },
  { to: "/my-tasks", label: "My Tasks", icon: CheckSquare, roles: ["admin", "employee"] },
  { to: "/team-tasks", label: "Team Tasks", icon: CheckSquare, roles: ["super_admin", "admin"] },
  { to: "/completed-tasks", label: "Completed Tasks", icon: CheckSquare, roles: ["super_admin", "admin", "employee"] },
  { to: "/super-admin/dashboard", label: "Org Overview", icon: UserCog, roles: ["super_admin"] },
  { to: "/super-admin", label: "Manage Admins", icon: Users, roles: ["super_admin"] },
  { to: "/admin", label: "Manage Employees", icon: Users, roles: ["admin"] },
  { to: "/group-tasks", label: "Group Tasks", icon: Group, roles: ["super_admin", "admin", "employee"] },
  { to: "/completed-group-tasks", label: "Completed Group", icon: CheckSquare, roles: ["super_admin", "admin", "employee"] },
  { to: "/profile", label: "Profile", icon: UserCircle, roles: ["super_admin", "admin", "employee"] },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAppSelector((s) => s.auth.user);
  const items = navItems.filter((i) => user && i.roles.includes(user.role));

  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-11",
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const theme = useAppSelector((s) => s.ui.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r md:block">
        <div className="flex h-16 items-center border-b px-6 font-bold text-lg">TaskFlow</div>
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => dispatch(setSidebarOpen(false))} />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] border-r bg-background shadow-xl">
            <div className="flex h-16 items-center border-b px-4 font-bold">TaskFlow</div>
            <SidebarContent onNavigate={() => dispatch(setSidebarOpen(false))} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(setSidebarOpen(true))}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 font-semibold truncate">TaskFlow</div>
          <NotificationBell />
          <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="relative group flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                {user?.profile_picture ? (
                  <img src={`/uploads/${user.profile_picture}`} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{user?.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <span className="hidden sm:inline text-muted-foreground">{user?.name}</span>
            </div>
            <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border bg-popover shadow-md p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
              <Link to="/profile" className="block px-2 py-1.5 text-sm rounded hover:bg-accent">Profile</Link>
              <button className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent text-destructive" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5 inline mr-1" />Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

