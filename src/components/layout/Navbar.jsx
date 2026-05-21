import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME, ROUTES } from '@/utils/constants'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(ROUTES.HOME)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={ROUTES.HOME}
          className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-xl font-bold text-transparent"
        >
          {APP_NAME}
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={ROUTES.JOIN}
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Join quiz
          </Link>
          {isAuthenticated && isAdmin ? (
            <>
              <Link
                to={ROUTES.DASHBOARD}
                className="hidden text-sm text-slate-300 transition-colors hover:text-white sm:inline"
              >
                Dashboard
              </Link>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {profile?.display_name || profile?.email}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
