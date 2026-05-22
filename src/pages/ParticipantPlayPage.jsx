import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EcoBackground from '@/components/ui/EcoBackground'
import QuestionCard from '@/components/live/QuestionCard'
import LiveLeaderboard from '@/components/live/LiveLeaderboard'
import PhaseBanner from '@/components/live/PhaseBanner'
import Podium from '@/components/live/Podium'
import { useLiveQuiz } from '@/hooks/useLiveQuiz'
import { useToast } from '@/contexts/ToastContext'
import { submitAnswer, fetchParticipantAnswer } from '@/services/answerService'
import { getParticipantSession } from '@/utils/participantStorage'
import { LIVE_PHASE, ROUTES, SESSION_STATUS } from '@/utils/constants'
import { resultsPath, waitingPath } from '@/utils/paths'
import { fetchQuestionsForQuiz } from '@/services/liveQuizService'

export default function ParticipantPlayPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const stored = getParticipantSession()

  const { session, question, leaderboard, loading, error, refreshSession } =
    useLiveQuiz(sessionId)

  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [submitLocked, setSubmitLocked] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)

  useEffect(() => {
    if (!stored || stored.sessionId !== sessionId) {
      navigate(ROUTES.JOIN, { replace: true })
    }
  }, [stored, sessionId, navigate])

  useEffect(() => {
    if (!session?.quiz_id) return
    fetchQuestionsForQuiz(session.quiz_id)
      .then((q) => setTotalQuestions(q.length))
      .catch(console.error)
  }, [session?.quiz_id])

  useEffect(() => {
    if (!stored?.participantId || !question?.id) return

    setSelectedAnswer(null)
    setPointsEarned(null)
    setSubmitLocked(false)

    fetchParticipantAnswer(stored.participantId, question.id).then((existing) => {
      if (existing) {
        setSelectedAnswer(existing.selected_answer)
        setSubmitLocked(true)
        setPointsEarned(existing.points_earned)
      }
    })
  }, [question?.id, stored?.participantId])

  useEffect(() => {
    if (!session) return

    if (session.status === SESSION_STATUS.WAITING) {
      navigate(waitingPath(sessionId), { replace: true })
      return
    }

    if (
      session.live_phase === LIVE_PHASE.PODIUM ||
      session.status === SESSION_STATUS.ENDED
    ) {
      navigate(resultsPath(sessionId), { replace: true })
    }
  }, [session, sessionId, navigate])

  const handleSelectAnswer = useCallback(
    async (option) => {
      if (submitLocked || session?.live_phase !== LIVE_PHASE.QUESTION) return
      if (!question?.id || !stored?.participantId) return

      setSelectedAnswer(option)

      try {
        const result = await submitAnswer({
          participantId: stored.participantId,
          questionId: question.id,
          selectedAnswer: option,
        })

        setSubmitLocked(true)
        setPointsEarned(result?.points_earned ?? 0)

        if (result?.is_correct) {
          toast.success(`🎉 Correct! +${result.points_earned} points`)
        } else {
          toast.info('📝 Answer recorded')
        }
      } catch (err) {
        setSelectedAnswer(null)
        toast.error(err.message || 'Could not submit answer')
      }
    },
    [submitLocked, session?.live_phase, question?.id, stored?.participantId, toast],
  )

  if (!stored || stored.sessionId !== sessionId) return null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EcoBackground />
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EcoBackground />
        <div className="glass-strong rounded-3xl p-8 max-w-md text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to={ROUTES.JOIN}
            className="inline-block eco-gradient text-white px-6 py-3 rounded-xl font-semibold"
          >
            Back to Join
          </Link>
        </div>
      </div>
    )
  }

  const livePhase = session?.live_phase ?? LIVE_PHASE.LOBBY
  const showQuestion =
    livePhase === LIVE_PHASE.QUESTION ||
    livePhase === LIVE_PHASE.REVEAL
  const showLeaderboard =
    livePhase === LIVE_PHASE.LEADERBOARD ||
    livePhase === LIVE_PHASE.REVEAL

  return (
    <section className="relative min-h-screen overflow-hidden py-8 sm:py-12">
      <EcoBackground />

      <div className="relative mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="glass-strong rounded-2xl px-6 py-4 inline-block">
            <p className="text-sm text-emerald-300 font-semibold">
              {session?.quizzes?.title || 'Pollution Awareness Quiz'}
            </p>
            <p className="mt-1 text-slate-300">
              Playing as{' '}
              <span className="font-bold text-gradient">{stored.nickname}</span>
            </p>
          </div>
        </motion.div>

        {/* Phase Banner */}
        <div className="mb-6">
          <PhaseBanner livePhase={livePhase} />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          {showQuestion && question && (
            <QuestionCard
              question={question}
              questionStartedAt={session?.question_started_at}
              livePhase={livePhase}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              submitLocked={submitLocked}
              totalQuestions={totalQuestions}
              pointsEarned={pointsEarned}
            />
          )}

          {showLeaderboard && (
            <div className={showQuestion ? 'mt-8 border-t border-white/10 pt-8' : ''}>
              <LiveLeaderboard
                entries={leaderboard}
                highlightId={stored.participantId}
              />
            </div>
          )}

          {livePhase === LIVE_PHASE.PODIUM && (
            <Podium entries={leaderboard} />
          )}
        </motion.div>
      </div>
    </section>
  )
}
