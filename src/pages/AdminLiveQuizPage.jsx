import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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
      <div className="py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <Card title="Session error">
        <p className="text-slate-400">{error || 'Session not found'}</p>
        <Link to={ROUTES.QUIZZES} className="mt-4 inline-block text-brand-400">
          ← Quizzes
        </Link>
      </Card>
    )
  }

  const livePhase = session.live_phase
  const isPodium = livePhase === LIVE_PHASE.PODIUM || session.status === SESSION_STATUS.ENDED

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Hosting live</p>
          <h1 className="text-2xl font-bold text-white">
            {session.quizzes?.title ?? 'Quiz'}
          </h1>
          <p className="mt-1 text-sm capitalize text-slate-400">
            Phase: <span className="text-brand-300">{livePhase}</span>
          </p>
        </div>
        <RoomCodeDisplay code={session.session_code} size="sm" />
      </div>

      <PhaseBanner livePhase={livePhase} />

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          layout
          className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          {(livePhase === LIVE_PHASE.QUESTION || livePhase === LIVE_PHASE.REVEAL) &&
            question && (
              <QuestionCard
                question={question}
                questionStartedAt={session.question_started_at}
                livePhase={livePhase}
                selectedAnswer={null}
                onSelectAnswer={() => {}}
                submitLocked
                totalQuestions={questions.length}
              />
            )}

          {livePhase === LIVE_PHASE.LEADERBOARD && (
            <p className="py-8 text-center text-slate-400">
              Showing leaderboard to players…
            </p>
          )}

          {isPodium && (
            <p className="py-8 text-center text-lg font-medium text-emerald-300">
              Quiz finished! Players see the final podium.
            </p>
          )}

          <p className="text-center text-xs text-slate-500">
            Questions advance automatically after each timer and leaderboard phase.
          </p>
        </motion.div>

        <div className="space-y-4">
          <Card title="Players" className="text-center">
            <p className="text-3xl font-bold text-brand-400">{participants.length}</p>
          </Card>

          <Card title="Live leaderboard">
            <LiveLeaderboard entries={leaderboard} />
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(ROUTES.QUIZZES)}>
          Exit host view
        </Button>
      </div>
    </div>
  )
}
