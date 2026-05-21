import { supabase } from '@/lib/supabase'

/**
 * Single multiplexed channel per session to reduce subscription overhead.
 */
export function createLiveQuizChannel(sessionId, handlers = {}) {
  const channel = supabase.channel(`live-quiz:${sessionId}`)

  if (handlers.onSession) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'quiz_sessions', filter: `id=eq.${sessionId}` },
      () => handlers.onSession(),
    )
  }

  if (handlers.onParticipants) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
      () => handlers.onParticipants(),
    )
  }

  if (handlers.onLeaderboard) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leaderboard', filter: `session_id=eq.${sessionId}` },
      () => handlers.onLeaderboard(),
    )
  }

  if (handlers.onAnswers) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'answers' },
      (payload) => {
        const row = payload.new ?? payload.old
        if (row && handlers.sessionIdForAnswers) {
          handlers.onAnswers()
        } else {
          handlers.onAnswers()
        }
      },
    )
  }

  channel.subscribe()
  return () => supabase.removeChannel(channel)
}
