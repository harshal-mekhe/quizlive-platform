import { supabase } from '@/lib/supabase'

export async function submitAnswer({ participantId, questionId, selectedAnswer }) {
  const { data, error } = await supabase.rpc('submit_answer', {
    p_participant_id: participantId,
    p_question_id: questionId,
    p_selected_answer: selectedAnswer,
  })

  if (error) throw error
  return data
}

export async function fetchParticipantAnswer(participantId, questionId) {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('participant_id', participantId)
    .eq('question_id', questionId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchSessionAnswerCount(sessionId, questionId) {
  const { count, error } = await supabase
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('question_id', questionId)

  if (error) throw error
  return count ?? 0
}
