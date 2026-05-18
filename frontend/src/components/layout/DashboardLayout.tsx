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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.ui.theme);
  const items = navItems.filter((i) => user && i.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        <Link to="/dashboard" className="flex h-14 items-center px-2 font-bold text-lg shrink-0">TaskFlow</Link>
        <Separator className="my-2 shrink-0" />
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors shrink-0",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-2">
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        <Separator />
        <div className="flex items-center gap-3 px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-0 h-auto hover:bg-transparent w-full">
                <Avatar className="h-8 w-8 shrink-0">
                  {user?.profile_picture ? (
                    <AvatarImage src={`/uploads/${user.profile_picture}`} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { navigate("/profile"); onNavigate?.(); }}>
                <UserCircle className="h-4 w-4 mr-2" />Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { dispatch(logout()); navigate("/login"); }} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r md:flex md:flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={(v) => dispatch(setSidebarOpen(v))}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-50 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => dispatch(setSidebarOpen(false))} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
