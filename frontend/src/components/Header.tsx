import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import type { RootState } from '../store'
import { logout } from '../features/authSlice'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { User, LogOut, Settings, Menu } from 'lucide-react'

export default function Header() {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout() as any)
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">TaskFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm">
                <Link to="/change-password">Change Password</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="flex items-center gap-3 p-2 border-b pb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button variant="ghost" className="justify-start">
                    <Link to="/change-password" onClick={() => setOpen(false)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Change Password
                    </Link>
                  </Button>

                  <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}