import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../features/authSlice'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { User, LogOut, Settings, Menu, Shield, Zap, Users } from 'lucide-react'

export default function Header() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const isSuperAdmin = user?.role === 'super_admin'
  const isAdmin = user?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] shadow-sm">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary)] text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] hidden sm:block">
              TaskFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3 px-3 py-2 bg-[var(--border-light)] rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-[var(--text-primary)]">{user.email}</p>
                  <p className="text-xs text-[var(--text-secondary)] capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pl-2">
              {isSuperAdmin && (
                <Button variant="ghost" size="sm">
                  <Link to="/super-admin" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                </Button>
              )}
              {isAdmin && (
                <Button variant="ghost" size="sm">
                  <Link to="/admin" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline">Employees</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Link to="/change-password" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Password</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col gap-6 mt-8">
                  {/* User Info */}
                  {user && (
                    <div className="flex items-center gap-4 p-4 bg-[var(--border-light)] rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">{user.email}</p>
                        <p className="text-sm text-[var(--text-secondary)] capitalize">
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    {isSuperAdmin && (
                      <Button variant="ghost" className="justify-start h-12" onClick={() => setOpen(false)}>
                        <Link to="/super-admin" className="flex items-center w-full">
                          <Shield className="w-5 h-5 mr-3" />
                          Admin Management
                        </Link>
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" className="justify-start h-12" onClick={() => setOpen(false)}>
                        <Link to="/admin" className="flex items-center w-full">
                          <Users className="w-5 h-5 mr-3" />
                          Employee Management
                        </Link>
                      </Button>
                    )}

                    <Button variant="ghost" className="justify-start h-12" onClick={() => setOpen(false)}>
                      <Link to="/change-password" className="flex items-center w-full">
                        <Settings className="w-5 h-5 mr-3" />
                        Change Password
                      </Link>
                    </Button>

                    <Button variant="ghost" className="justify-start h-12 text-[var(--error)] hover:text-[var(--error)]" onClick={handleLogout}>
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}