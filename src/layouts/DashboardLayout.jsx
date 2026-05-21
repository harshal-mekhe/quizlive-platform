import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME, ROUTES } from '@/utils/constants'
import Button from '@/components/ui/Button'

const navItems = [
  { label: 'Overview', path: ROUTES.DASHBOARD },
  { label: 'Quizzes', path: ROUTES.QUIZZES },
]

export default function DashboardLayout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900/50 lg:flex">
        <div className="border-b border-slate-800 p-6">
          <Link
            to={ROUTES.HOME}
            className="text-lg font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent"
          >
            {APP_NAME}
          </Link>
          <p className="mt-1 text-xs text-slate-500">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-slate-200">
            {profile?.display_name || 'Admin'}
          </p>
          <p className="truncate text-xs text-slate-500">{profile?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/30 px-4 py-4 lg:px-8">
          <nav className="flex gap-4 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-brand-400' : 'text-slate-400'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
