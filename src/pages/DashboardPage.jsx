import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EcoBackground from '@/components/ui/EcoBackground'
import ActiveSessionsList from '@/components/quiz/ActiveSessionsList'
import { fetchDashboardStats } from '@/services/quizService'
import { fetchAdminSessions } from '@/services/sessionService'
import { ROUTES } from '@/utils/constants'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false))

    fetchAdminSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoadingSessions(false))
  }, [])

  const statCards = [
    {
      title: 'Quizzes',
      description: 'In your library',
      value: stats?.quizCount ?? 0,
      icon: '📝',
      gradient: 'from-emerald-500 to-teal-500',
      link: ROUTES.QUIZZES,
    },
    {
      title: 'Sessions',
      description: 'Rooms hosted',
      value: stats?.sessionCount ?? 0,
      icon: '🎮',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Participants',
      description: 'Total joins',
      value: stats?.participantCount ?? 0,
      icon: '👥',
      gradient: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div className="relative min-h-screen">
      <EcoBackground />
      
      <div className="relative space-y-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-gradient">{profile?.display_name || 'Admin'}</span>
            </h1>
            <p className="text-lg text-slate-300 flex items-center gap-2">
              <span>🌍</span>
              Manage quizzes, host live rooms, and track participants
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.QUIZ_NEW}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="eco-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30">
                  <span className="flex items-center gap-2">
                    <span>➕</span>
                    Create Quiz
                  </span>
                </Button>
              </motion.div>
            </Link>
            <Link to={ROUTES.JOIN} target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" className="glass-strong px-6 py-3 rounded-xl hover:bg-white/20">
                  <span className="flex items-center gap-2">
                    <span>🔗</span>
                    Join Link
                  </span>
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="glass-strong rounded-3xl p-6 border-2 border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                    {card.description}
                  </p>
                  <h3 className="text-xl font-bold text-white mt-1">{card.title}</h3>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`text-4xl bg-gradient-to-br ${card.gradient} p-3 rounded-2xl`}
                >
                  {card.icon}
                </motion.div>
              </div>
              
              {loadingStats ? (
                <LoadingSpinner className="py-4" />
              ) : (
                <>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: index * 0.1 + 0.3 }}
                    className="text-5xl font-bold text-gradient mb-2"
                  >
                    {card.value}
                  </motion.p>
                  {card.link && (
                    <Link
                      to={card.link}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      View all <span>→</span>
                    </Link>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Live Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-3xl p-8 border-2 border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🟢</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Live Rooms</h2>
              <p className="text-slate-400">Waiting and active sessions you can re-enter</p>
            </div>
          </div>
          <ActiveSessionsList sessions={sessions} loading={loadingSessions} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-3xl p-8 border-2 border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚡</span>
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.QUIZ_NEW}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="glass-strong px-6 py-3 rounded-xl hover:bg-white/20 flex items-center gap-2">
                  <span>🎯</span>
                  Create Quiz
                </Button>
              </motion.div>
            </Link>
            <Link to={ROUTES.QUIZZES}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="glass-strong px-6 py-3 rounded-xl hover:bg-white/20 flex items-center gap-2">
                  <span>📊</span>
                  Manage Quizzes
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
