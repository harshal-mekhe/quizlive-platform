import { useCallback, useEffect, useRef } from 'react'
import {
  advanceToQuestion,
  endLiveQuiz,
  fetchQuestionsForQuiz,
  updateLivePhase,
} from '@/services/liveQuizService'
import { refreshLeaderboard } from '@/services/leaderboardService'
import { LIVE_PHASE, PHASE_DURATIONS, SESSION_STATUS } from '@/utils/constants'
import { isTimerExpired } from '@/utils/timer'

/**
 * Admin-only phase orchestration (drives auto transitions).
 */
export function useHostQuizFlow({ session, question, questions, onRefresh }) {
  const transitioningRef = useRef(false)
  const questionsRef = useRef(questions)
  questionsRef.current = questions

  const runTransition = useCallback(
    async (fn) => {
      if (transitioningRef.current) return
      transitioningRef.current = true
      try {
        await fn()
        await onRefresh?.()
      } finally {
        transitioningRef.current = false
      }
    },
    [onRefresh],
  )

  const goToReveal = useCallback(async () => {
    if (!session?.id) return
    await runTransition(() =>
      updateLivePhase(session.id, LIVE_PHASE.REVEAL),
    )
  }, [session?.id, runTransition])

  const goToLeaderboard = useCallback(async () => {
    if (!session?.id) return
    await runTransition(async () => {
      await refreshLeaderboard(session.id)
      await updateLivePhase(session.id, LIVE_PHASE.LEADERBOARD)
    })
  }, [session?.id, runTransition])

  const goToNextQuestionOrEnd = useCallback(async () => {
    if (!session?.id) return
    const qs = questionsRef.current
    const currentIndex =
      question?.question_index ?? session.current_question_index ?? 0
    const nextIndex = currentIndex + 1

    await runTransition(async () => {
      if (nextIndex >= qs.length) {
        await endLiveQuiz(session.id)
      } else {
        await advanceToQuestion(session.id, qs[nextIndex], nextIndex)
      }
    })
  }, [session?.id, session?.current_question_index, question?.question_index, runTransition])

  const goToPodium = useCallback(async () => {
    if (!session?.id) return
    await runTransition(() => endLiveQuiz(session.id))
  }, [session?.id, runTransition])

  // Auto: question timer ended -> reveal
  useEffect(() => {
    if (!session || session.status !== SESSION_STATUS.ACTIVE) return
    if (session.live_phase !== LIVE_PHASE.QUESTION) return
    if (!session.question_started_at || !question?.time_limit_seconds) return

    const duration = question.time_limit_seconds
    const started = session.question_started_at

    const check = () => {
      if (isTimerExpired(started, duration)) {
        goToReveal()
      }
    }

    check()
    const id = setInterval(check, 300)
    return () => clearInterval(id)
  }, [
    session?.id,
    session?.status,
    session?.live_phase,
    session?.question_started_at,
    question?.time_limit_seconds,
    goToReveal,
  ])

  // Auto: reveal -> leaderboard
  useEffect(() => {
    if (session?.live_phase !== LIVE_PHASE.REVEAL) return

    const id = setTimeout(() => {
      goToLeaderboard()
    }, PHASE_DURATIONS.REVEAL_MS)

    return () => clearTimeout(id)
  }, [session?.id, session?.live_phase, goToLeaderboard])

  // Auto: leaderboard -> next question or podium
  useEffect(() => {
    if (session?.live_phase !== LIVE_PHASE.LEADERBOARD) return

    const id = setTimeout(() => {
      goToNextQuestionOrEnd()
    }, PHASE_DURATIONS.LEADERBOARD_MS)

    return () => clearTimeout(id)
  }, [
    session?.id,
    session?.live_phase,
    session?.current_question_index,
    goToNextQuestionOrEnd,
  ])

  return { goToReveal, goToLeaderboard, goToNextQuestionOrEnd, goToPodium }
}
