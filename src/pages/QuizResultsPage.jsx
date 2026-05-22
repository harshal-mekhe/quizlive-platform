import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EcoBackground from '@/components/ui/EcoBackground'
import Podium from '@/components/live/Podium'
import LiveLeaderboard from '@/components/live/LiveLeaderboard'
import Button from '@/components/ui/Button'
import { useLiveQuiz } from '@/hooks/useLiveQuiz'
import { getParticipantSession, clearParticipantSession } from '@/utils/participantStorage'
import { ROUTES } from '@/utils/constants'

export default function QuizResultsPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const stored = getParticipantSession()

  const { session, leaderboard, loading, error } = useLiveQuiz(sessionId)

  useEffect(() => {
    return () => {
      // Keep storage so user can see results; clear on navigate home manually
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EcoBackground />
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <section className="relative overflow-hidden min-h-screen py-12 sm:py-20">
      <EcoBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl px-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-4">
            <span className="text-2xl">🌍</span>
            <span className="text-emerald-300 font-semibold">
              {session?.quizzes?.title ?? 'Pollution Awareness Quiz'}
            </span>
          </div>
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-8 text-center"
          >
            <span className="text-6xl mb-4 block">⚠️</span>
            <p className="text-red-400 text-lg">{error}</p>
          </motion.div>
        ) : (
          <>
            {/* Podium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-3xl p-8 sm:p-12 shadow-2xl mb-8"
            >
              <Podium entries={leaderboard} />
            </motion.div>

            {/* Full Leaderboard */}
            {leaderboard.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-strong rounded-3xl p-8"
              >
                <LiveLeaderboard
                  entries={leaderboard}
                  highlightId={stored?.participantId}
                  title="📊 Full Standings"
                />
              </motion.div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to={ROUTES.JOIN}>
            <Button className="eco-gradient text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105">
              🔄 Join Another Quiz
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="glass-strong px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
            onClick={() => {
              clearParticipantSession()
              navigate(ROUTES.HOME)
            }}
          >
            🏠 Back to Home
          </Button>
        </motion.div>

        {/* Share Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center glass-strong rounded-2xl p-6"
        >
          <p className="text-slate-300 text-lg">
            🌟 Share your score and spread pollution awareness!
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
