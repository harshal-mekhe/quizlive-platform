import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import QuestionEditor from '@/components/quiz/QuestionEditor'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { createQuiz, fetchQuizById, updateQuiz } from '@/services/quizService'
import { OPTIONS_PER_QUESTION, QUIZ_STATUS, ROUTES } from '@/utils/constants'
import {
  createDefaultQuestions,
  createEmptyQuestion,
  hasValidationErrors,
  validateQuizForm,
} from '@/utils/quizHelpers'

function mapQuestionsFromDb(questions) {
  return questions.map((q, index) => {
    const options = Array.isArray(q.options) ? [...q.options] : []
    while (options.length < OPTIONS_PER_QUESTION) options.push('')

    return {
      clientId: q.id,
      id: q.id,
      question_text: q.question_text,
      options,
      correct_answer: q.correct_answer,
      order_index: index,
      time_limit_seconds: q.time_limit_seconds ?? 30,
    }
  })
}

export default function QuizFormPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const isCreate = pathname.endsWith('/new')
  const isEdit = !isCreate && Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(QUIZ_STATUS.DRAFT)
  const [questions, setQuestions] = useState(() => createDefaultQuestions())
  const [errors, setErrors] = useState({})

  const loadQuiz = useCallback(async () => {
    if (!isEdit || !id) return

    setLoading(true)
    setLoadError('')

    try {
      const quiz = await fetchQuizById(id)
      setTitle(quiz.title)
      setDescription(quiz.description || '')
      setStatus(quiz.status)
      setQuestions(
        quiz.questions?.length
          ? mapQuestionsFromDb(quiz.questions)
          : createDefaultQuestions(),
      )
    } catch (err) {
      const message = err.message || 'Quiz not found'
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [id, isEdit])

  useEffect(() => {
    if (isCreate) {
      setLoading(false)
      return
    }
    loadQuiz()
  }, [isCreate, loadQuiz])

  function updateQuestion(index, updated) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)))
  }

  function moveQuestion(index, direction) {
    setQuestions((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((q, i) => ({ ...q, order_index: i }))
    })
  }

  function removeQuestion(index) {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i })),
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateQuizForm({ title, questions })
    setErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      toast.error('Please fix the form errors')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to save a quiz')
      return
    }

    setSaving(true)
    try {
      const payload = { title, description, status, questions }

      if (isEdit) {
        await updateQuiz(id, payload)
        toast.success('Quiz updated')
      } else {
        await createQuiz({ ...payload, adminId: user.id })
        toast.success('Quiz created')
      }
      navigate(ROUTES.QUIZZES)
    } catch (err) {
      toast.error(err.message || 'Failed to save quiz')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-400">Loading quiz…</p>
      </div>
    )
  }

  if (loadError && isEdit) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-20 text-center">
        <p className="text-red-400">{loadError}</p>
        <Link to={ROUTES.QUIZZES}>
          <Button variant="secondary">Back to quizzes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          to={ROUTES.QUIZZES}
          className="text-sm text-slate-400 hover:text-brand-400"
        >
          ← Back to quizzes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          {isEdit ? 'Edit quiz' : 'Create quiz'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Quiz details</h2>
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Science Trivia Night"
            error={errors.title}
            required
          />
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A fun quiz about..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-300">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value={QUIZ_STATUS.DRAFT}>Draft</option>
              <option value={QUIZ_STATUS.PUBLISHED}>Published</option>
              <option value={QUIZ_STATUS.ARCHIVED}>Archived</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Questions</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
              + Add question
            </Button>
          </div>
          {errors.questions && (
            <p className="text-sm text-red-400">{errors.questions}</p>
          )}
          <div className="space-y-6">
            {questions.map((q, index) => (
              <QuestionEditor
                key={q.clientId}
                question={q}
                index={index}
                total={questions.length}
                errors={errors}
                onChange={(updated) => updateQuestion(index, updated)}
                onMoveUp={() => moveQuestion(index, -1)}
                onMoveDown={() => moveQuestion(index, 1)}
                onRemove={() => removeQuestion(index)}
                canRemove={questions.length > 1}
              />
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-6">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create quiz'}
          </Button>
          <Link to={ROUTES.QUIZZES}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
