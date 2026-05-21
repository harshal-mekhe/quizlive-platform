import { supabase } from '@/lib/supabase'

const POSTGRES_UNIQUE_VIOLATION = '23505'

export async function joinSession({ sessionId, nickname }) {
  const trimmedNickname = nickname.trim()

  const { data, error } = await supabase
    .from('participants')
    .insert({
      session_id: sessionId,
      nickname: trimmedNickname,
    })
    .select()
    .single()

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new Error('This nickname is already taken in this room. Choose another.')
    }
    throw error
  }

  return data
}

export async function fetchParticipants(sessionId) {
  const { data, error } = await supabase
    .from('participants')
    .select('id, nickname, joined_at, score')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export function subscribeToParticipants(sessionId, onChange) {
  const channel = supabase
    .channel(`participants:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `session_id=eq.${sessionId}`,
      },
      async () => {
        const participants = await fetchParticipants(sessionId)
        onChange(participants)
      },
    )
    .subscribe()

  fetchParticipants(sessionId).then(onChange).catch(console.error)

  return () => {
    supabase.removeChannel(channel)
  }
}
