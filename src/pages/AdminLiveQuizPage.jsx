import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EcoBackground from '@/components/ui/EcoBackground'
import QuestionCard from '@/components/live/QuestionCard'
import LiveLeaderboard from '@/components/live/LiveLeaderboard'
import PhaseBanner from '@/components/live/PhaseBanner'
import RoomCodeDisplay from '@/components/quiz/RoomCodeDisplay'
import { useLiveQuiz } from '@/hooks/useLiveQuiz'
import { useHostQuizFlow } from '@/hooks/useHostQuizFlow'
import { fetchQuestionsForQuiz } from '@/services/liveQuizService'
import { LIVE_PHASE, ROUTES, SESSION_STATUS } from '@/utils/constants'
import { adminWaitingPath } from '@/utils/paths'

export default function AdminLiveQuizPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])

  const {
    session,
    question,
    leaderboard,
    participants,
    loading,
    error,
    refreshSession,
  } = useLiveQuiz(sessionId)

  useEffect(() => {
    if (!session?.quiz_id) return
    fetchQuestionsForQuiz(session.quiz_id).then(setQuestions).catch(console.error)
  }, [session?.quiz_id])

  useHostQuizFlow({
    session,
    question,
    questions,
    onRefresh: refreshSession,
  })

  useEffect(() => {
    if (!session) return
    if (session.status === SESSION_STATUS.WAITING) {
      navigate(adminWaitingPath(sessionId), { replace: true })
    }
  }, [session, sessionId, navigate])

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <EcoBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative py-20"
        >
          <LoadingSpinner size="lg" />
        </motion.div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        <EcoBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto max-w-md py-20"
        >
          <div className="glass-strong rounded-3xl p-8 backdrop-blur-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Session Error</h2>
            <p className="text-slate-400 mb-6">{error || 'Session not found'}</p>
            <Link to={ROUTES.QUIZZES}>
              <Button className="eco-gradient text-white font-semibold w-full">
                ← Back to Quizzes
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const livePhase = session.live_phase
  const isPodium = livePhase === LIVE_PHASE.PODIUM || session.status === SESSION_STATUS.ENDED

  return (
    <div className="relative overflow-hidden min-h-screen">
      <EcoBackground />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-start justify-between gap-6"
          >
            <div>
              <p className="text-sm text-emerald-300 uppercase tracking-wide font-semibold">
                🎬 Hosting Live
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mt-2">
                {session.quizzes?.title ?? 'Quiz'}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-3 text-lg text-slate-300 flex items-center gap-2"
              >
                <span className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-sm">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Phase: <span className="text-emerald-300 font-semibold capitalize">{livePhase}</span>
                </span>
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RoomCodeDisplay code={session.session_code} size="lg" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <PhaseBanner livePhase={livePhase} />
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Question and Leaderboard Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
              className="lg:col-span-2 glass-strong rounded-3xl p-8 border-2 border-white/10 backdrop-blur-2xl space-y-6"
            >
              {(livePhase === LIVE_PHASE.QUESTION || livePhase === LIVE_PHASE.REVEAL) &&
                question && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <QuestionCard
                      question={question}
                      questionStartedAt={session.question_started_at}
                      livePhase={livePhase}
                      selectedAnswer={null}
                      onSelectAnswer={() => {}}
                      submitLocked
                      totalQuestions={questions.length}
                    />
                  </motion.div>
                )}

              {livePhase === LIVE_PHASE.LEADERBOARD && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-lg text-slate-300 flex flex-col items-center gap-3"
                >
                  <span className="text-4xl">🏆</span>
                  <span>Showing leaderboard to players…</span>
                </motion.p>
              )}

              {isPodium && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-xl font-bold text-emerald-300 flex flex-col items-center gap-3"
                >
                  <span className="text-5xl">🎉</span>
                  <span>Quiz finished! Players see the final podium.</span>
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-slate-400 border-t border-white/10 pt-4"
              >
                ⏱️ Questions advance automatically after each timer and leaderboard phase.
              </motion.p>
            </motion.div>

            {/* Sidebar Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-4"
            >
              {/* Participants Card */}
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                className="glass-strong rounded-2xl p-6 border-2 border-white/10 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">👥</span>
                  <p className="text-sm text-slate-400 uppercase tracking-wide">Players</p>
                </div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="text-4xl font-bold text-emerald-400"
                >
                  {participants.length}
                </motion.p>
              </motion.div>

              {/* Live Leaderboard Card */}
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                className="glass-strong rounded-2xl p-6 border-2 border-white/10 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🥇</span>
                  <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                </div>
                <LiveLeaderboard entries={leaderboard} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Exit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 border-t border-white/10 pt-8"
          >
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.QUIZZES)}
              className="glass-strong hover:bg-white/20 px-6 py-3 rounded-2xl"
            >
              🚪 Exit Host View
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
