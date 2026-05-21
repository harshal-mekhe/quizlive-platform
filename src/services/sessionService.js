import { supabase } from '@/lib/supabase'
import { generateRoomCode, isValidRoomCodeFormat, normalizeRoomCode } from '@/utils/roomCode'
import { SESSION_STATUS } from '@/utils/constants'

const MAX_CODE_ATTEMPTS = 12
const POSTGRES_UNIQUE_VIOLATION = '23505'

/** Returns existing waiting room for quiz, or creates a new one with a unique code. */
export async function getOrCreateWaitingSession(quizId) {
  const { data: existing, error: findError } = await supabase
    .from('quiz_sessions')
    .select('*, quizzes(title)')
    .eq('quiz_id', quizId)
    .eq('status', SESSION_STATUS.WAITING)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return { session: existing, created: false }

  const session = await createSessionWithRoomCode(quizId)
  return { session, created: true }
}

export async function fetchAdminSessions({ limit = 10 } = {}) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('id, session_code, status, created_at, started_at, quiz_id, quizzes(title)')
    .in('status', [SESSION_STATUS.WAITING, SESSION_STATUS.ACTIVE])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function createSessionWithRoomCode(quizId) {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const sessionCode = generateRoomCode()

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        quiz_id: quizId,
        session_code: sessionCode,
        status: SESSION_STATUS.WAITING,
      })
      .select('*, quizzes(title)')
      .single()

    if (!error) return data

    if (error.code === POSTGRES_UNIQUE_VIOLATION) continue
    throw error
  }

  throw new Error('Could not generate a unique room code. Please try again.')
}

export async function validateRoomCode(rawCode) {
  const sessionCode = normalizeRoomCode(rawCode)

  if (!isValidRoomCodeFormat(sessionCode)) {
    return { valid: false, error: 'Room code must be 6 characters (letters and numbers).' }
  }

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('id, session_code, status, quiz_id, quizzes(title)')
    .eq('session_code', sessionCode)
    .maybeSingle()

  if (error) throw error

  if (!data) {
    return { valid: false, error: 'Room not found. Check the code and try again.' }
  }

  if (data.status === SESSION_STATUS.ENDED) {
    return { valid: false, error: 'This quiz session has already ended.' }
  }

  if (data.status === SESSION_STATUS.ACTIVE) {
    return { valid: false, error: 'This quiz has already started. Late joins are not available yet.' }
  }

  return { valid: true, session: data, sessionCode }
}

export async function fetchSessionById(sessionId) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*, quizzes(id, title, admin_id)')
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data
}

export async function startQuizSession(sessionId) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      status: SESSION_STATUS.ACTIVE,
      started_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('status', SESSION_STATUS.WAITING)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Session is no longer in waiting status.')
  return data
}

export function subscribeToSession(sessionId, onChange) {
  const channel = supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quiz_sessions',
        filter: `id=eq.${sessionId}`,
      },
      () => {
        fetchSessionById(sessionId)
          .then(onChange)
          .catch(console.error)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
