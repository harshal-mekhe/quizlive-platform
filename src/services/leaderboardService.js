import { supabase } from '@/lib/supabase'

export async function fetchLeaderboard(sessionId) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      rank,
      score,
      participant_id,
      participants (id, nickname)
    `)
    .eq('session_id', sessionId)
    .order('rank', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    rank: row.rank,
    score: row.score,
    participantId: row.participant_id,
    nickname: row.participants?.nickname ?? 'Player',
  }))
}

export async function refreshLeaderboard(sessionId) {
  const { error } = await supabase.rpc('refresh_session_leaderboard', {
    p_session_id: sessionId,
  })
  if (error) throw error
}
