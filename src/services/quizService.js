import { supabase } from '@/lib/supabase'
import { mapQuestionForDb } from '@/utils/quizHelpers'

export async function fetchQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      status,
      created_at,
      updated_at,
      questions (id)
    `)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((quiz) => ({
    ...quiz,
    question_count: quiz.questions?.length ?? 0,
    questions: undefined,
  }))
}

export async function fetchQuizById(quizId) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  if (error) throw error

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })

  if (questionsError) throw questionsError

  return { ...data, questions: questions ?? [] }
}

export async function createQuiz({ title, description, status, adminId, questions }) {
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      status,
      admin_id: adminId,
    })
    .select()
    .single()

  if (quizError) throw quizError

  if (questions?.length) {
    const rows = questions.map((q, index) =>
      mapQuestionForDb({ ...q, order_index: index }, quiz.id),
    )

    const { error: questionsError } = await supabase.from('questions').insert(rows)
    if (questionsError) {
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      throw questionsError
    }
  }

  return quiz
}

export async function updateQuiz(quizId, { title, description, status, questions }) {
  const { error: quizError } = await supabase
    .from('quizzes')
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      status,
    })
    .eq('id', quizId)

  if (quizError) throw quizError

  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('quiz_id', quizId)

  if (deleteError) throw deleteError

  if (questions?.length) {
    const rows = questions.map((q, index) =>
      mapQuestionForDb({ ...q, order_index: index }, quizId),
    )

    const { error: insertError } = await supabase.from('questions').insert(rows)
    if (insertError) throw insertError
  }

  return fetchQuizById(quizId)
}

export async function deleteQuiz(quizId) {
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
  if (error) throw error
}

export async function fetchDashboardStats() {
  const [quizzesRes, sessionsRes] = await Promise.all([
    supabase.from('quizzes').select('id', { count: 'exact', head: true }),
    supabase.from('quiz_sessions').select('id', { count: 'exact', head: true }),
  ])

  if (quizzesRes.error) throw quizzesRes.error
  if (sessionsRes.error) throw sessionsRes.error

  const { count: participantCount, error: participantsError } = await supabase
    .from('participants')
    .select('id', { count: 'exact', head: true })

  if (participantsError) throw participantsError

  return {
    quizCount: quizzesRes.count ?? 0,
    sessionCount: sessionsRes.count ?? 0,
    participantCount: participantCount ?? 0,
  }
}
