import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-3xl px-4"
      >
        <p className="mb-2 text-center text-sm text-slate-500">
          {session?.quizzes?.title ?? 'Quiz'}
        </p>

        {error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl">
              <Podium entries={leaderboard} />
            </div>

            {leaderboard.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <LiveLeaderboard
                  entries={leaderboard}
                  highlightId={stored?.participantId}
                  title="Full standings"
                />
              </div>
            )}
          </>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to={ROUTES.JOIN}>
            <Button>Join another quiz</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              clearParticipantSession()
              navigate(ROUTES.HOME)
            }}
          >
            Home
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
