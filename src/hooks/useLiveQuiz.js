import { useCallback, useEffect, useRef, useState } from 'react'
import { createLiveQuizChannel } from '@/lib/realtime/liveQuizChannel'
import { fetchSessionById } from '@/services/sessionService'
import { getCurrentQuestion } from '@/services/liveQuizService'
import { fetchLeaderboard } from '@/services/leaderboardService'
import { fetchParticipants } from '@/services/participantService'

export function useLiveQuiz(sessionId) {
  const [session, setSession] = useState(null)
  const [question, setQuestion] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const refreshAll = useCallback(async () => {
    if (!sessionId) return

    try {
      const [sess, q, lb, parts] = await Promise.all([
        fetchSessionById(sessionId),
        getCurrentQuestion(sessionId),
        fetchLeaderboard(sessionId),
        fetchParticipants(sessionId),
      ])

      if (!mountedRef.current) return

      setSession(sess)
      setQuestion(q)
      setLeaderboard(lb)
      setParticipants(parts)
      setError(null)
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [sessionId])

  const refreshSession = useCallback(async () => {
    if (!sessionId) return
    const [sess, q] = await Promise.all([
      fetchSessionById(sessionId),
      getCurrentQuestion(sessionId),
    ])
    if (mountedRef.current) {
      setSession(sess)
      setQuestion(q)
    }
  }, [sessionId])

  const refreshLeaderboardOnly = useCallback(async () => {
    const lb = await fetchLeaderboard(sessionId)
    if (mountedRef.current) setLeaderboard(lb)
  }, [sessionId])

  useEffect(() => {
    mountedRef.current = true
    refreshAll()

    const unsubscribe = createLiveQuizChannel(sessionId, {
      onSession: refreshSession,
      onParticipants: async () => {
        const parts = await fetchParticipants(sessionId)
        if (mountedRef.current) setParticipants(parts)
      },
      onLeaderboard: refreshLeaderboardOnly,
      onAnswers: refreshLeaderboardOnly,
    })

    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [sessionId, refreshAll, refreshSession, refreshLeaderboardOnly])

  return {
    session,
    question,
    leaderboard,
    participants,
    loading,
    error,
    refreshAll,
    refreshSession,
    refreshLeaderboard: refreshLeaderboardOnly,
  }
}
