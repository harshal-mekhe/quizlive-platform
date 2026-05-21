import { DEFAULT_QUESTION_TIME, MIN_QUESTIONS, OPTIONS_PER_QUESTION } from '@/utils/constants'

export function createEmptyQuestion(orderIndex = 0) {
  return {
    clientId: crypto.randomUUID(),
    id: null,
    question_text: '',
    options: Array(OPTIONS_PER_QUESTION).fill(''),
    correct_answer: '',
    order_index: orderIndex,
    time_limit_seconds: DEFAULT_QUESTION_TIME,
  }
}

export function createDefaultQuestions(count = MIN_QUESTIONS) {
  return Array.from({ length: count }, (_, i) => createEmptyQuestion(i))
}

export function validateQuizForm({ title, questions }) {
  const errors = {}

  if (!title?.trim()) {
    errors.title = 'Quiz title is required'
  }

  if (!questions?.length) {
    errors.questions = 'Add at least one question'
    return errors
  }

  questions.forEach((q, index) => {
    if (!q.question_text?.trim()) {
      errors[`question_${index}_text`] = 'Question text is required'
    }

    const trimmedOptions = q.options.map((o) => o?.trim() ?? '')
    const filledOptions = trimmedOptions.filter(Boolean)
    if (filledOptions.length < OPTIONS_PER_QUESTION) {
      errors[`question_${index}_options`] = 'All 4 options are required'
    } else if (new Set(filledOptions).size !== filledOptions.length) {
      errors[`question_${index}_options`] = 'All options must be unique'
    }

    if (!q.correct_answer?.trim()) {
      errors[`question_${index}_correct`] = 'Select the correct answer'
    } else if (!q.options.includes(q.correct_answer)) {
      errors[`question_${index}_correct`] = 'Correct answer must match an option'
    }

    if (!q.time_limit_seconds || q.time_limit_seconds < 5) {
      errors[`question_${index}_timer`] = 'Timer must be at least 5 seconds'
    }
  })

  return errors
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0
}

export function mapQuestionForDb(q, quizId) {
  return {
    quiz_id: quizId,
    question_text: q.question_text.trim(),
    options: q.options.map((o) => o.trim()),
    correct_answer: q.correct_answer.trim(),
    order_index: q.order_index,
    time_limit_seconds: Number(q.time_limit_seconds),
  }
}
