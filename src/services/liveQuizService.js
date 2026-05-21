import { supabase } from '@/lib/supabase'
import { LIVE_PHASE, SESSION_STATUS } from '@/utils/constants'
import { fetchSessionById } from '@/services/sessionService'

export async function fetchQuestionsForQuiz(quizId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getCurrentQuestion(sessionId) {
  const { data, error } = await supabase.rpc('get_current_question', {
    p_session_id: sessionId,
  })

  if (error) throw error
  return data
}

export async function startLiveQuiz(sessionId, questions) {
  if (!questions?.length) {
    throw new Error('Quiz has no questions')
  }

  const first = questions[0]
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      status: SESSION_STATUS.ACTIVE,
      started_at: now,
      current_question_index: 0,
      current_question_id: first.id,
      question_started_at: now,
      live_phase: LIVE_PHASE.QUESTION,
    })
    .eq('id', sessionId)
    .eq('status', SESSION_STATUS.WAITING)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Session is no longer in waiting status.')

  await supabase.rpc('refresh_session_leaderboard', { p_session_id: sessionId })

  return data
}

export async function updateLivePhase(sessionId, livePhase, extra = {}) {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({ live_phase: livePhase, ...extra })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function advanceToQuestion(sessionId, question, questionIndex) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      current_question_index: questionIndex,
      current_question_id: question.id,
      question_started_at: now,
      live_phase: LIVE_PHASE.QUESTION,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function endLiveQuiz(sessionId) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      status: SESSION_STATUS.ENDED,
      ended_at: now,
      live_phase: LIVE_PHASE.PODIUM,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error

  await supabase.rpc('refresh_session_leaderboard', { p_session_id: sessionId })

  return data
}

export async function fetchLiveSessionState(sessionId) {
  const session = await fetchSessionById(sessionId)
  const question = await getCurrentQuestion(sessionId)
  return { session, question }
}
