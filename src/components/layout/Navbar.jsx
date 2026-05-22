import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/utils/constants'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(ROUTES.HOME)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-white/10 glass-strong backdrop-blur-2xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-3 group"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl"
          >
            🌍
          </motion.span>
          <span className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform">
            EcoQuiz
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to={ROUTES.JOIN}
            className="text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-2"
          >
            <span>🎮</span>
            <span className="hidden sm:inline">Join Quiz</span>
          </Link>
          {isAuthenticated && isAdmin ? (
            <>
              <Link
                to={ROUTES.DASHBOARD}
                className="hidden sm:inline text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                📊 Dashboard
              </Link>
              <span className="hidden sm:inline text-sm text-slate-400 glass px-3 py-1.5 rounded-full">
                {profile?.display_name || profile?.email}
              </span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                className="glass-strong hover:bg-white/20"
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="glass hover:bg-white/10"
                >
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <Button 
                  size="sm"
                  className="eco-gradient text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
